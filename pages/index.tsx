/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useContext, useState, FormEvent, useEffect } from "react";

import { useForm } from "react-hook-form";
import AuthContext from "../context/AuthContext";
import { createStrapiMarket, deployMarket } from "../utils/deployMarket";
import { getGasPrice } from "../utils/gas_lib";
import Confirm from "../components/Confirm";

import styles from "../styles/Home.module.css";
import { Market } from "../models/Market";
import { Question } from "../models/Question";
import { Condition } from "../models/Condition";
import { Form, FormTypes } from "../models/FormInput";

export default function Home() {
    const { user, provider, getToken } = useContext(AuthContext);

    const [outcomes, setOutcomes] = useState([]);

    const [outcomeState, setOutcomeState] = useState("");

    const [wideFormat, setWideformat] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [manualGasCheck, setManualGasCheck] = useState(false);

    const {
        register,
        setValue,
        getValues,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormTypes>({
        defaultValues: {
            [Form.Title]: "",
            [Form.Description]: "",
            [Form.Outcome]: "",
            [Form.Outcomes]: [],
            [Form.Category]: "",
            [Form.Image]: "",
            [Form.Icon]: "",
            [Form.Fee]: 0.02,
            [Form.Oracle]: "",
            [Form.ResolutionSource]: "",
            [Form.SubmittedBy]: "",
            [Form.EndDate]: "",
            [Form.WideFormat]: false,
            [Form.UserDefinedGas]: 0,
            [Form.MarketMakerAddress]: undefined,
        },
    });
    const hasAddress = watch(Form.MarketMakerAddress);

    /**
     * On change of inputs update the outcome
     * @param e
     */
    const handleChangeOutcome = (e: FormEvent<HTMLInputElement>) => {
        setOutcomeState(e.currentTarget.value);
        setValue(Form.Outcome, e.currentTarget.value);
    };

    /**
     * Add the outcome to array outcomes
     */
    const handleClickOutcome = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (outcomeState && outcomeState !== "") {
            outcomes.push(outcomeState);
            setOutcomes(outcomes);
        }
        const value = getValues(Form.Outcome);
        const array = getValues(Form.Outcomes);
        if (value && value !== "") {
            array.push(value);
            setValue(Form.Outcomes, array);
            setValue(Form.Outcome, "");
            setOutcomeState("");
        }
    };

    /**
     * On change of inputs update the end date
     * @param e
     */
    const handleChangeEndDate = (e: FormEvent<HTMLInputElement>) => {
        const date = new Date(e.currentTarget.value);

        const formattedDate = date.toLocaleDateString("default", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        });
        setValue(Form.EndDate, formattedDate);
    };

    /**
     * Prevent fee changing on scroll
     * @param e
     */
    const handleScroll = (e: FormEvent<HTMLInputElement>) => {
        e.currentTarget.blur();
    };
    const handleYesClick = () => {
        setWideformat(true);
        setValue(Form.WideFormat, true);
    };
    const handleNoClick = () => {
        setWideformat(false);
        setValue(Form.WideFormat, false);
    };

    /**
     * Delete the outcome selected to outcomes
     * @param outcome
     */
    const deleteOutcome = (outcomeToDelete: string) => {
        const newOutcomesState = [...outcomes];
        const idx = outcomes.findIndex((out) => out === outcomeToDelete);

        if (idx > -1) {
            newOutcomesState.splice(idx, 1);
        }

        setOutcomes(newOutcomesState);
        const newOutcomes = getValues(Form.Outcomes);
        const index = outcomes.findIndex((out) => out === outcomeToDelete);

        if (index > -1) {
            newOutcomes.splice(index, 1);
        }

        setValue(Form.Outcomes, newOutcomes);
    };

    const onSubmit = () => {
        setConfirm(true);
    };

    /**
     * Deploy the market
     */
    const deploy = async (data: FormTypes) => {
        setLoading(true);
        const question = new Question(data.title, data.description);

        const condition = new Condition(data.outcomes, data.oracle);
        const market: Market = new Market(question, condition, data.fee);
        const signer = provider.getSigner();

        try {
            const gasPrice = await getGasPrice(data.userDefinedGas, provider);
            const deployAddress = await deployMarket(market, signer, gasPrice);
            setValue(Form.MarketMakerAddress, deployAddress);
        } catch (err) {
            alert(`Something went wrong ${err.toString()}`);
            setLoading(false);
            setConfirm(false);
        }
    };
    const create = async (values: FormTypes) => {
        console.log("Creating Strapi Market...");
        const data = {
            title: values.title,
            description: values.description,
            outcomes: values.outcomes,
            category: values.category,
            oracle: values.oracle,
            image: values.image,
            icon: values.icon,
            fee: values.fee,
            endDate: values.endDate,
            resolutionSource: values.resolutionSource,
            submittedBy: values.submittedBy,
            wideFormat: values.wideFormat,
            mmAddress: values.marketMakerAddress,
        };
        let responseStatus: number;
        try {
            const token = await getToken();
            responseStatus = await createStrapiMarket(
                data,
                provider.getSigner(),
                token,
            );
        } catch (err) {
            alert(`Something went wrong ${err.toString()}`);
            setLoading(false);
            setConfirm(false);
        }
        setConfirm(false);
        setLoading(false);
        if (responseStatus === 200) {
            alert(
                `Market ${values.title} deployed at ${hasAddress} and added to strapi `,
            );
        } else {
            alert(
                `Market ${values.title} deployed at ${hasAddress}. Strapi creation failed`,
            );
        }
        setValue(Form.MarketMakerAddress, undefined);
    };

    useEffect(() => {
        if (hasAddress) {
            handleSubmit(create)();
        }
    }, [hasAddress]);

    return (
        <div>
            <Head>
                <title>NextJS Magic template</title>
                <meta name="description" content="Nextjs Magic template" />
            </Head>

            {!user && <h1>Please login with Magic!</h1>}

            {user && (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={styles.form_market}
                >
                    <h3> Question </h3>

                    <h6>Title</h6>
                    <input
                        {...register(Form.Title, { required: true })}
                        type="text"
                    />
                    {errors.title && "Required"}
                    <h6>Description</h6>
                    <textarea
                        {...register(Form.Description, { required: true })}
                    />
                    {errors.description && "Required"}
                    <h3> Category </h3>
                    <input {...register(Form.Category)} type="text" />
                    <h3> Image </h3>
                    <input {...register(Form.Image)} type="text" />
                    <h3> Icon </h3>
                    <input {...register(Form.Icon)} type="text" />

                    <h3> Outcomes </h3>
                    <input
                        onChange={(e) => {
                            handleChangeOutcome(e);
                        }}
                        value={getValues(Form.Outcome)}
                        name="outcome"
                    />

                    <button
                        onClick={handleClickOutcome}
                        style={{ marginTop: "10px" }}
                    >
                        Add
                    </button>

                    {outcomes && (
                        <div className={styles.table}>
                            {outcomes.map((out) => (
                                <button
                                    className={styles.element}
                                    key={out}
                                    onClick={() => deleteOutcome(out)}
                                >
                                    <img src="/times-solid.svg" alt="delete" />
                                    <p>{out}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    <h3> Wide Format </h3>

                    <div className={styles.toggle_content}>
                        <div className={styles.toggle_body}>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => handleYesClick()}
                                    className={
                                        wideFormat
                                            ? styles.button_yes
                                            : styles.button_no
                                    }
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    className={
                                        wideFormat
                                            ? styles.button_no
                                            : styles.button_yes
                                    }
                                    onClick={() => handleNoClick()}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>

                    <h3> Oracle </h3>
                    <input {...register(Form.Oracle)} type="text" />

                    <h3> End Date </h3>
                    <input onChange={handleChangeEndDate} type="date" />

                    <h3> Resolution Source </h3>
                    <input {...register(Form.ResolutionSource)} type="text" />

                    <h3> Submitted By </h3>
                    <input {...register(Form.SubmittedBy)} type="text" />

                    <h3> Fee </h3>
                    <input
                        {...register(Form.Fee, { valueAsNumber: true })}
                        type="text"
                        onWheelCapture={handleScroll}
                    />

                    <div>
                        <label htmlFor="manualGasPrice">
                            <div>
                                <input
                                    style={{ width: "20px", margin: "1.5px" }}
                                    id="manualGasPrice"
                                    type="checkbox"
                                    checked={manualGasCheck}
                                    onChange={(e) =>
                                        setManualGasCheck(
                                            e.currentTarget.checked,
                                        )
                                    }
                                />
                                <small>Manually enter gas price?</small>
                            </div>
                        </label>
                        <input
                            {...register(Form.UserDefinedGas, {
                                min: 0,
                                max: 10000,
                            })}
                            hidden={!manualGasCheck}
                            type="number"
                        />
                    </div>

                    <div className={styles.submit}>
                        <button
                            disabled={
                                manualGasCheck &&
                                Number.isNaN(Form.UserDefinedGas)
                            }
                            type="submit"
                        >
                            Save Market
                        </button>
                        <p
                            hidden={
                                !manualGasCheck ||
                                (manualGasCheck &&
                                    !Number.isNaN(Form.UserDefinedGas))
                            }
                        >
                            Manually input gas is invalid
                        </p>
                    </div>
                </form>
            )}

            {confirm && (
                <Confirm
                    yes={handleSubmit(deploy)}
                    no={() => {
                        setConfirm(false);
                        setLoading(false);
                    }}
                    loading={loading}
                />
            )}
        </div>
    );
}
