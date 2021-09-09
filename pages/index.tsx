/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useContext, useState, FormEvent, useEffect } from "react";

import AuthContext from "../context/AuthContext";
import { createStrapiMarket, deployMarket } from "../utils/deployMarket";
import { getGasPrice } from "../utils/gas_lib";
import Confirm from "../components/Confirm";

import styles from "../styles/Home.module.css";
import { Market } from "../models/Market";
import { Question } from "../models/Question";
import { Condition } from "../models/Condition";

export default function Home() {
    const { user, provider, getToken } = useContext(AuthContext);
    const [question, setQuestion] = useState(new Question());
    const [outcomes, setOutcomes] = useState([]);
    const [outcome, setOutcome] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState<string>("");
    const [icon, setIcon] = useState<string>("");
    const [fee, setFee] = useState(0.02);
    const [oracle, setOracle] = useState("");
    const [resolutionSource, setResolutionSource] = useState("");
    const [submittedBy, setSubmittedBy] = useState("");
    const [endDate, setEndDate] = useState("");
    const [wideFormat, setWideformat] = useState<boolean>(false);
    const [checkTitle, setCheckTitle] = useState(false);
    const [checkDescription, setCheckDescription] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [manualGasCheck, setManualGasCheck] = useState(false);
    const [userDefinedGas, setUserDefinedGas] = useState<number>(0);
    const [mmAddress, setMmAddress] = useState();
    const [hasAddress, setHasAddress] = useState(false);

    /**
     * On change of inputs update the question
     * @param e
     */
    const handleChangeQuestion = (
        e: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.currentTarget;
        setQuestion((element) => ({ ...element, [name]: value }));
    };

    /**
     * On change of inputs update the outcome
     * @param e
     */
    const handleChangeOutcome = (e: FormEvent<HTMLInputElement>) => {
        setOutcome(e.currentTarget.value);
    };

    /**
     * On change of inputs update the fee
     * @param e
     */
    const handleChangeFee = (e: FormEvent<HTMLInputElement>) => {
        setFee(parseFloat(e.currentTarget.value));
    };

    /**
     * Add the outcome to array outcomes
     */
    const handleClickOutcome = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (outcome && outcome !== "") {
            outcomes.push(outcome);
            setOutcomes(outcomes);
            setOutcome("");
        }
    };

    /**
     * On change of inputs update the category
     * @param e
     */
    const handleChangeCategory = (e: FormEvent<HTMLInputElement>) => {
        setCategory(e.currentTarget.value);
    };

    /**
     * On change of inputs update the image
     * @param e
     */
    const handleChangeImage = (e: FormEvent<HTMLInputElement>) => {
        setImage(e.currentTarget.value);
    };
    /**
     * On change of inputs update the icon
     * @param e
     */
    const handleChangeIcon = (e: FormEvent<HTMLInputElement>) => {
        setIcon(e.currentTarget.value);
    };
    /**
     * On change of inputs update the oracle
     * @param e
     */
    const handleChangeOracle = (e: FormEvent<HTMLInputElement>) => {
        setOracle(e.currentTarget.value);
    };
    /**
     * On change of inputs update the end date
     * @param e
     */
    const handleChangeEndDate = (e: FormEvent<HTMLInputElement>) => {
        setEndDate(e.currentTarget.value);
    };
    /**
     * On change of inputs update the oracle
     * @param e
     */
    const handleChangeResolutionSource = (e: FormEvent<HTMLInputElement>) => {
        setResolutionSource(e.currentTarget.value);
    };
    /**
     * On change of inputs update the oracle
     * @param e
     */
    const handleChangeSubmittedBy = (e: FormEvent<HTMLInputElement>) => {
        setSubmittedBy(e.currentTarget.value);
    };
    /**
     * Prevent fee changing on scroll
     * @param e
     */
    const handleScroll = (e: FormEvent<HTMLInputElement>) => {
        e.currentTarget.blur();
    };

    /**
     * Delete the outcome selected to outcomes
     * @param outcome
     */
    const deleteOutcome = (outcomeToDelete: string) => {
        const newOutcomes = [...outcomes];
        const index = outcomes.findIndex((out) => out === outcomeToDelete);

        if (index > -1) {
            newOutcomes.splice(index, 1);
        }

        setOutcomes(newOutcomes);
    };

    /**
     * Requires confirm to save Markets
     * @param e
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const invalidTitle = question.title === "";
        const invalidDescription = question.description === "";

        setCheckTitle(invalidTitle);
        setCheckDescription(invalidDescription);

        if (!invalidTitle && !invalidDescription) {
            setConfirm(true);
        } else {
            setLoading(false);
        }
    };

    const handleChangeUserGasPrice = (e: FormEvent<HTMLInputElement>) => {
        setUserDefinedGas(parseFloat(e.currentTarget.value));
    };

    /**
     * Deploy the market
     */
    const deploy = async () => {
        setLoading(true);

        const condition = new Condition(outcomes, oracle);
        const market: Market = new Market(question, condition, fee);
        const signer = provider.getSigner();

        try {
            const gasPrice = await getGasPrice(userDefinedGas, provider);
            const deployAddress = await deployMarket(market, signer, gasPrice);
            setMmAddress(deployAddress);
        } catch (err) {
            alert(`Something went wrong ${err.toString()}`);
        }
    };
    const create = async () => {
        const data = {
            question,
            outcomes,
            category,
            oracle,
            image,
            icon,
            fee,
            endDate,
            resolutionSource,
            submittedBy,
            wideFormat,
            mmAddress,
        };
        try {
            const token = await getToken();
            console.log(token);
            await createStrapiMarket(data, provider.getSigner(), token);
        } catch (err) {
            alert(err.message);
        }
        setConfirm(false);
        setLoading(false);
        alert(`Market deployed at ${mmAddress} `);
        setMmAddress(undefined);
    
    };

    useEffect(() => {
        if (mmAddress) {
            create();
        }
     
    }, [mmAddress]);

    return (
        <div>
            <Head>
                <title>NextJS Magic template</title>
                <meta name="description" content="Nextjs Magic template" />
            </Head>

            {!user && <h1>Please login with Magic!</h1>}

            {user && (
                <form onSubmit={handleSubmit} className={styles.form_market}>
                    <h3> Question </h3>

                    <h6>Title</h6>
                    <input
                        type="text"
                        value={question.title}
                        name="title"
                        onChange={handleChangeQuestion}
                        className={checkTitle ? styles.check_input : ""}
                    />

                    {checkTitle && <p className={styles.check_p}> Required </p>}

                    <h6>Description</h6>
                    <textarea
                        value={question.description}
                        name="description"
                        onChange={handleChangeQuestion}
                        className={checkDescription ? styles.check_input : ""}
                    />

                    {checkDescription && (
                        <p className={styles.check_p}> Required </p>
                    )}
                    <h3> Category </h3>
                    <input
                        type="text"
                        value={category}
                        name="Category"
                        onChange={handleChangeCategory}
                    />
                    <h3> Image </h3>
                    <input
                        type="text"
                        value={image}
                        name="Image"
                        onChange={handleChangeImage}
                    />
                    <h3> Icon </h3>
                    <input
                        type="text"
                        value={icon}
                        name="Icon"
                        onChange={handleChangeIcon}
                    />

                    <h3> Outcomes </h3>
                    <input
                        type="text"
                        value={outcome}
                        name="outcome"
                        onChange={handleChangeOutcome}
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
                                    onClick={() => setWideformat(true)}
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
                                    onClick={() => setWideformat(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>

                    <h3> Oracle </h3>
                    <input
                        type="text"
                        value={oracle}
                        name="oracle"
                        onChange={handleChangeOracle}
                    />
                    <h3> End Date </h3>
                    <input
                        type="date"
                        value={endDate}
                        name="endDate"
                        onChange={handleChangeEndDate}
                    />
                    <h3> Resolution Source </h3>
                    <input
                        type="text"
                        value={resolutionSource}
                        name="resolutionSource"
                        onChange={handleChangeResolutionSource}
                    />
                    <h3> Submitted By </h3>
                    <input
                        type="text"
                        value={submittedBy}
                        name="submittedBy"
                        onChange={handleChangeSubmittedBy}
                    />

                    <h3> Fee </h3>
                    <input
                        type="number"
                        value={fee}
                        name="fee"
                        onChange={handleChangeFee}
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
                            type="number"
                            min={0}
                            max={1000}
                            hidden={!manualGasCheck}
                            value={userDefinedGas}
                            name="userDefinedGas"
                            onChange={handleChangeUserGasPrice}
                        />
                    </div>

                    <div className={styles.submit}>
                        <button
                            disabled={
                                manualGasCheck && Number.isNaN(userDefinedGas)
                            }
                            type="submit"
                        >
                            Save Market
                        </button>
                        <p
                            hidden={
                                !manualGasCheck ||
                                (manualGasCheck &&
                                    !Number.isNaN(userDefinedGas))
                            }
                        >
                            Manually input gas is invalid
                        </p>
                    </div>
                </form>
            )}

            {confirm && (
                <Confirm
                    yes={async () => {
                        await deploy();
                    }}
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
