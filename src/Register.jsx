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
  Welcome,
  Submit
} from "@react-login-page/page3";
import LoginLogo from "react-login-page/logo-rect";
import BannerImage from'./assets/signup.jpg'

const register = () => (
  <LoginPage style={{ height: 580 }}>
     <Title>Create an Account</Title>
    <Welcome>Hey! Please create an account to use INKLane.</Welcome>
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
    <Submit>Register</Submit>
    <ButtonAfter>
      Already have an account ? &nbsp;   <a href="#">click to log in</a>
    </ButtonAfter>
  </LoginPage>
);

export default register;
