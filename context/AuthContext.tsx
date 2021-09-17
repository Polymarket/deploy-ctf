/* eslint-disable dot-notation */
import { createContext, useState, useEffect, useContext } from "react";
import { Magic } from "magic-sdk";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import { MATIC_CONFIG, MAGIC_KEY } from "../utils/network";

import { User } from "../models/User";
import { APIWebClient } from "../api/ApiWebClient";

interface AuthContext {
    user: User | null;
    loginUser: (email: string) => void;
    logoutUser: () => void;
    checkUserLoggedIn: () => void;
    getToken: () => Promise<string>;
    provider: ethers.providers.Web3Provider | null;
}

const AuthContext = createContext<AuthContext>({
    user: null,
    loginUser: (email: string) => null,
    logoutUser: () => null,
    checkUserLoggedIn: () => null,
    getToken: () => null,
    provider: null,
});

let magic;

export const AuthProvider = (props) => {
    const [user, setUser] = useState<User | null>(null);
    const [provider, setProvider] = useState(null);
    const router = useRouter();

    /**
     * Log the user out
     */
    const logoutUser = async () => {
        try {
            await magic.user.logout();
            setUser(null);
            router.push("/");
        } catch (err) {
            setUser(user);
        }
    };
    /**
     * Retrieve Magic Issued Bearer Token
     * This allows User to make authenticated requests
     */
    const getToken = async () => {
        let token: string;

        try {
            token = await magic.user.getIdToken();
        } catch (err) {
            logoutUser();
        }

        return token;
    };

    /**
     * Log the user in
     * @param {string} email
     */
    const loginUser = async (email: string) => {
        try {
            await magic.auth.loginWithMagicLink({ email });
            const magicProvider = new ethers.providers.Web3Provider(
                magic.rpcProvider,
            );
            const token = await getToken();
            const userRole = await APIWebClient.getUser(token);
            console.log(userRole.data.role);
            if (userRole.data.role["name"] !== "Market Creator") {
                throw new Error("You are not authorized to use this app");
            }
            const signer = magicProvider.getSigner();
            const address = await signer.getAddress();
            setProvider(magicProvider);
            setUser({ email, address });

            router.push("/");
        } catch (err) {
            logoutUser();
            alert(err);
        }
    };

    /**
     * If user is logged in, get data and display it
     */
    const checkUserLoggedIn = async () => {
        try {
            const isLoggedIn = await magic.user.isLoggedIn();

            if (isLoggedIn) {
                const { email } = await magic.user.getMetadata();
                const magicProvider = new ethers.providers.Web3Provider(
                    magic.rpcProvider,
                );
                const signer = magicProvider.getSigner();
                const address = await signer.getAddress();
                const token = await getToken();
                const userRole = await APIWebClient.getUser(token);
                if (userRole.data.role["name"] !== "Market Creator") {
                    throw new Error("You are not authorized to use this app");
                }

                setProvider(magicProvider);
                setUser({ email, address });
            }
        } catch (err) {
            logoutUser();
            alert(err);
        }
    };

    /**
     * Reload user login on app refresh
     */
    useEffect(() => {
        magic = new Magic(MAGIC_KEY, {
            network: MATIC_CONFIG,
        });

        checkUserLoggedIn();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                logoutUser,
                loginUser,
                checkUserLoggedIn,
                getToken,
                provider,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export const useAddress = () => {
    const { user } = useContext(AuthContext);

    return user?.address;
};

export const useLogin = () => {
    const { loginUser } = useContext(AuthContext);

    return loginUser;
};

export const useLogout = () => {
    const { logoutUser } = useContext(AuthContext);

    return logoutUser;
};

export const useUser = () => {
    const { user } = useContext(AuthContext);

    return user;
};

export const useProvider = () => {
    const { provider } = useContext(AuthContext);

    return provider;
};
