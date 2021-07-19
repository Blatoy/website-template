import React from "react";
import { Header } from "../components/header/Header.js";

export function Root(): React.ReactElement {
    return (
        <Header routes={[
            { path: "/", text: "Home" },
            { path: "/about", text: "About" },
        ]} ></Header >
    );
}