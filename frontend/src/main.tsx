import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import App from "./App.js";
import {Provider} from "./provider.tsx";
import "@/styles/globals.css";
// import {DevSupport} from "@react-buddy/ide-toolbox";
// import {ComponentPreviews, useInitial} from "@/dev";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider>
                {/*<DevSupport ComponentPreviews={ComponentPreviews}*/}
                {/*            useInitialHook={useInitial}*/}
                {/*>*/}
                    <App/>
                {/*</DevSupport>*/}
            </Provider>
        </BrowserRouter>
    </React.StrictMode>,
);
