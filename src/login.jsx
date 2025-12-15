import React from "react";
import LoginPage, {
  Reset,
  Logo,
  Email,
  Banner,
  ButtonAfter,
  Password,
  Input,
  Title,
  Welcome
} from "@react-login-page/page3";
import LoginLogo from "react-login-page/logo-rect";
import BannerImage from'./assets/signup.jpg'

const Demo = () => (
  <LoginPage style={{ height: 580 }}>
     <Title>Log in to Your Account</Title>
    <Welcome>Hey! Please enter your details to sign in.</Welcome>
    <Logo visible={false} />
    <Email index={3} placeholder="Email" />
    <Password index={2} />
    <Email
      rename="E-mail"
      label="E-mail:"
      type="tel"
      index={1}
      placeholder="Email"
    >
      <div>xx</div>
    </Email>
    <Banner style={{ backgroundImage: `url(${BannerImage})` }} />
    <ButtonAfter>
      Forgot <a href="#">Username / Password?</a>
    </ButtonAfter>
  </LoginPage>
);

export default Demo;
