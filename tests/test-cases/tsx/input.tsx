import React from "react";

interface SkeletonProps {
  history: History;
}

const Skeleton = ({ history }: SkeletonProps) => (
  <div className={String(history.length)} />
);

const AppImpl = () => (
    <Skeleton history={history} />
);
