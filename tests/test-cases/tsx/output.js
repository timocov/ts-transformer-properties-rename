import React from "react";
const Skeleton = ({ _internal_history: history }) => (React.createElement("div", { className: String(history.length) }));
const AppImpl = () => (React.createElement(Skeleton, { _internal_history: history }));
