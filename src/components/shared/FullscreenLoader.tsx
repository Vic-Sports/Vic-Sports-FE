import React from "react";
import ReactDOM from "react-dom";
import { Spin, Typography } from "antd";
import "./FullscreenLoader.scss";

const { Text } = Typography;

interface FullscreenLoaderProps {
  message?: string;
}

const FullscreenLoader: React.FC<FullscreenLoaderProps> = ({ message }) => {
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fullscreen-loader">
      <Spin size="large" />
      {message && <Text className="loader-text">{message}</Text>}
    </div>,
    document.body
  );
};

export default FullscreenLoader;
