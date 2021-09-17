import { BigNumber, ethers } from "ethers";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import { getAddress, Interface } from "ethers/lib/utils";
import {
    ORACLE_ADDRESS,
    CONDITIONAL_TOKENS_ADDRESS,
    POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS,
    USDC_ADDRESS,
} from "./network";

import { Market } from "../models/Market";

import abi from "./abi/ConditionalTokens.json";
import abiPolymarket from "./abi/PolymarketMarketMakerFactory.json";
import { APIWebClient } from "../api/ApiWebClient";

const iFixedProductMarketMakerCreation = new Interface([
    "event FixedProductMarketMakerCreation (address indexed creator, address fixedProductMarketMaker, address indexed conditionalTokens, address indexed collateralToken, bytes32[] conditionIds, uint fee)",
]);

// Credits: https://gist.github.com/mathewbyrne/1280286
const slugify = (text = "") =>
    text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text

/**
 * Returns the questionId hashing title and description
 * @param title
 * @param description
 */
const getQuestionId = (title: string, description: string): string => {
    return solidityKeccak256(["string", "string"], [title, description]);
};

/**
 * Given a contract and a market returns the condition prepared
 * @param conditionalTokensContract
 * @param market
 */
const prepareCondition = async (
    conditionalTokensContract: ethers.Contract,
    market: Market,
    gasPrice: BigNumber,
): Promise<any> => {
    const { condition, question } = market;
    const questionId = getQuestionId(question.title, question.description);
    const numOutcomes = condition.outcomes.length;

    return conditionalTokensContract.prepareCondition(
        condition.oracle,
        questionId,
        numOutcomes,
        { gasPrice },
    );
};

/**
 * Deploys the market on polymarket
 * @param polymarketMarketMakerFactory
 * @param conditionalTokensAddress
 * @param collateralTokenAddress
 * @param market
 */
const deployPolymarket = async (
    polymarketMarketMakerFactory: ethers.Contract,
    conditionalTokensAddress: string,
    collateralTokenAddress: string,
    market: Market,
    gasPrice: BigNumber,
): Promise<any> => {
    const questionObject = {
        question: market.question,
        conditions: [market.condition],
    };
    const fee = ethers.utils.parseEther(market.fee.toString());

    const marketMaker = await polymarketMarketMakerFactory.createPolymarketFixedProductMarketMaker(
        conditionalTokensAddress,
        collateralTokenAddress,
        questionObject,
        fee,
        { gasPrice },
    );
    return marketMaker;
};

/**
 * Given a market and a signer deploys the market
 * @param market
 * @param provider
 */
export const deployMarket = async (
    market: Market,
    signer: ethers.Signer,
    gasPrice: BigNumber,
): Promise<any> => {
    const conditionalTokens = new ethers.Contract(
        CONDITIONAL_TOKENS_ADDRESS,
        abi,
        signer,
    );

    const marketFactory = new ethers.Contract(
        POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS,
        abiPolymarket,
        signer,
    );

    console.log("Preparing Condition...");
    const prepareTx = await prepareCondition(
        conditionalTokens,
        market,
        gasPrice,
    );
    await prepareTx.wait();

    console.log("Deploying Market...");
    const deployTx = await deployPolymarket(
        marketFactory,
        conditionalTokens.address,
        USDC_ADDRESS,
        market,
        gasPrice,
    );
    const receipt = await deployTx.wait();
    let data: any; // eslint-disable-line
    for (let i = 0; i < receipt.logs.length; i += 1) {
        try {
            data = iFixedProductMarketMakerCreation.decodeEventLog(
                "FixedProductMarketMakerCreation",
                receipt.logs[i].data,
            );
        } catch (e) {} // eslint-disable-line

        if (data) break;
    }

    return data.fixedProductMarketMaker;
};
export const createStrapiMarket = async (
    market: {
        title: string;
        description: string;
        outcomes?: string[];
        oracle?: string;
        category?: string;
        image?: string;
        icon?: string;
        fee?: number;
        endDate?: string;
        resolutionSource?: string;
        submittedBy?: string;
        wideFormat?: boolean;
        mmAddress: string;
    },
    signer: ethers.Signer,
    token: string,
): Promise<number> => {
    const questionId = getQuestionId(market.title, market.description);
    const numOutcomes = market.outcomes.length;
    const conditionalTokens = new ethers.Contract(
        CONDITIONAL_TOKENS_ADDRESS,
        abi,
        signer,
    );
    let oracle;

    if (market.oracle === "") {
        oracle = ORACLE_ADDRESS;
    } else {
        oracle = market.oracle;
    }

    const conditionId = await conditionalTokens.getConditionId(
        oracle,
        questionId,
        numOutcomes,
    );
   

    const response = await APIWebClient.addMarket(
        {
            question: market.title,
            description: market.description,
            slug: slugify(market.title),
            category: market.category,
            image: market.image,
            icon: market.icon,
            marketMakerAddress: getAddress(market.mmAddress),
            outcomePrices: market.outcomes.map(() => "0"),
            outcomes: market.outcomes,
            resolution_source: market.resolutionSource,
            end_date: market.endDate,
            submitted_by: market.submittedBy,
            liquidity: "0",
            conditionId,
            volume: "0",
            fee: ethers.utils.parseEther(market.fee.toString()).toString(),
            wide_format: market.wideFormat,
            new: true,
            active: false,
            closed: false,
        },
        token,
    );
    console.log("market", response);
    return response.status;
};
