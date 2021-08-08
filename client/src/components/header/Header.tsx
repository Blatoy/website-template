import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

type HeaderProps = {
    routes: URL[]
};

type URL = {
    path: string,
    text: string
};

export const Header: React.FunctionComponent<HeaderProps> = ({ routes }) => {
    return (
            <Route2r>
            <Switch>
                {
                    routes.map((url, index) =>
                        <Route exact={url.path === "/"} key={index} path={url.path}>
                            <h1>{url.text}</h1>
                        </Route>
                    )
                }
            </Switch>
            <div>
                <nav>
                    <ul>
                        {
                            routes.map((url, index) =>
                                <li key={index}>
                                    <Link to={url.path}>{url.text}</Link>
                                </li>
                            )
                        }
                    </ul>
                </nav>
            </div>
        </Router>);
};