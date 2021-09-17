import url from "url";

export const MAGIC_KEY = process.env.NEXT_PUBLIC_MAGIC_KEY;

export enum Network {
    Mainnet = "mainnet",
    Matic = "matic",
}

type Environment = {
    mainnetNetwork: {
        rpcUrl: string;
        chainId: number;
        explorerUrl: string;
    };
    maticNetwork: {
        rpcUrl: string;
        chainId: number;
        explorerUrl: string;
    };
    strapiUrl: string;
    subgraphUrl: string;
    maticUsdc: string;
    mainnetUsdc: string;
    maticBridge: {
        rootChainManagerProxy: string;
        erc20PredicateProxy: string;
    };
    conditionalTokens: string;
    proxyWalletFactory: string;
    polymarketMarketMakerFactory: string;
    oracle: string;
};

/*
 * An environment is made up of the following values:
 *
 * mainnetNetwork / maticNetwork: The network objects as required for initialising Magic SDK
 * See: https://docs.magic.link/client-sdk/web#create-an-sdk-instance
 *
 * subgraphUrl: URL of a graph node tracking the Polymarket contracts on maticNetwork.
 * strapiUrl: URL of a strapi server which is tracking the Polymarket subgraph for maticNetwork.
 *
 * maticUsdc / maticUsdc: Addresses of the USDC token on Matic / Mainnet.
 * See: https://docs.matic.network/docs/develop/network-details/mapped-token
 *
 * maticBridge: An object containing the addresses on the main chainused to deposit funds into Matic.
 * See: https://github.com/maticnetwork/static/blob/master/network/mainnet/v1/index.json
 * See: https://github.com/maticnetwork/static/blob/master/network/testnet/mumbai/index.json
 *
 */
const environments: { mainnet: Environment; mumbai: Environment } = {
    mainnet: {
        mainnetNetwork: {
            rpcUrl:
                "https://mainnet.infura.io/v3/a414a8f640db48c5aa8fcc3bf29353e8",
            chainId: 1,
            explorerUrl: "https://etherscan.io",
        },
        maticNetwork: {
            rpcUrl:
                "https://rpc-mainnet.maticvigil.com/v1/ea1bb94329e5fa87489704c1141745bdab51f1b0",
            chainId: 137,
            explorerUrl: "https://explorer-mainnet.maticvigil.com",
        },
        strapiUrl: "https://strapi-matic.poly.market",
        subgraphUrl:
            "https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket",
        maticUsdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        mainnetUsdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        maticBridge: {
            rootChainManagerProxy: "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77",
            erc20PredicateProxy: "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
        },
        conditionalTokens: "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
        proxyWalletFactory: "0xaB45c5A4B0c941a2F231C04C3f49182e1A254052",
        polymarketMarketMakerFactory:
            "0xeF2e639bbDBBAF483Cb8E9FaaE20B96534C740D3",
        oracle: "0x2EF848Af24eB23E8EA67184B6391B0C5a1775ed5",
    },
    mumbai: {
        mainnetNetwork: {
            rpcUrl:
                "https://goerli.infura.io/v3/a414a8f640db48c5aa8fcc3bf29353e8",
            chainId: 5,
            explorerUrl: "https://goerli.etherscan.io",
        },
        maticNetwork: {
            rpcUrl: "https://rpc-mumbai.maticvigil.com/v1/ea1bb94329e5fa87489704c1141745bdab51f1b0",
            chainId: 80001,
            explorerUrl: "https://explorer-mumbai.maticvigil.com",
        },
        strapiUrl: "https://strapi-mumbai-staging.herokuapp.com/",
        subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/tokenunion/polymarket-mumbai",
        maticUsdc: "0xdEe897d5E6eaA6365F293c37cB3fA8335B9B8f3F",
        mainnetUsdc: "0x9DA9Bc12b19b22d7C55798F722A1B6747AE9A710",
        maticBridge: {
            rootChainManagerProxy: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
            erc20PredicateProxy: "0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34",
        },
        conditionalTokens: "0x7D8610E9567d2a6C9FBf66a5A13E9Ba8bb120d43",
        proxyWalletFactory: "0xaB45c5A4B0c941a2F231C04C3f49182e1A254052",
        polymarketMarketMakerFactory:
            "0xb66ad17f931AAbBACa85bc79D28F74284b8eE04c",
        oracle: "0x2EF848Af24eB23E8EA67184B6391B0C5a1775ed5",
    },
};

// Pull default config for environment from `environments`.
// Each individual value can then be further overridden if necessary
const selectedEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;
if (selectedEnvironment !== "mainnet" && selectedEnvironment !== "mumbai") {
    throw new Error(
        `Invalid environment: ${selectedEnvironment}. Please select one of mainnet or mumbai`,
    );
}

const selectedEnvironmentConfig = environments[selectedEnvironment];
export const CONDITIONAL_TOKENS_ADDRESS =
    selectedEnvironmentConfig.conditionalTokens;
export const POLYMARKET_MARKET_MAKER_FACTORY_ADDRESS =
    selectedEnvironmentConfig.polymarketMarketMakerFactory;
export const MAINNET_CONFIG = selectedEnvironmentConfig.mainnetNetwork;
export const MATIC_CONFIG = selectedEnvironmentConfig.maticNetwork;

export const USDC_ADDRESS =
    process.env.NEXT_PUBLIC_MATIC_USDC || selectedEnvironmentConfig.maticUsdc;
export const MAINNET_USDC_ADDRESS =
    process.env.NEXT_PUBLIC_MAINNET_USDC ||
    selectedEnvironmentConfig.mainnetUsdc;

export const ORACLE_ADDRESS = selectedEnvironmentConfig.oracle;
export const STRAPI_URL = selectedEnvironmentConfig.strapiUrl;
