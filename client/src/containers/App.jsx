import {
  DashboardOutlined,
  ControlOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  FileSearchOutlined,
  LockOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Tooltip, message, ConfigProvider } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import routes from "../constants/routes.json";
import "../app.global.css";

const { SubMenu } = Menu;
const { Header, Sider, Content } = Layout;

const App = (props) => {
  const history = useHistory();
  const { children, lang } = props;
  // dormakaba-theme
  // default-theme
  const [theme] = useState("occ-theme");

  const newPathArr = [props.location.pathname.split("/")[1]];

  return (
    <Layout style={{ height: "100vh" }} className={theme}>
      <Layout className="site-layout">
        <Header className="site-layout-header" style={{ padding: 0 }}></Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "20px",
            display: "flex",
            minHeight: 280,
          }}
        >
          <ConfigProvider>{children}</ConfigProvider>
        </Content>
      </Layout>
    </Layout>
  );
};

function mapStateToProps({ lang }) {
  return {
    lang,
  };
}

export default connect(mapStateToProps, null)(App);
