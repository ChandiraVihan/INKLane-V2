import React from "react";
import LoginPage, {
  Title,
  Welcome,
  Email,
  Password,
  Banner,
  ButtonAfter,
  Logo,
} from "@react-login-page/page3";
import BannerImage from './assets/signin.jpg';

const Login = () => (
  <LoginPage
    style={{ height: 580 }}
    contentStyle={{ background: 'transparent' }} // This is the correct prop
  >
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

export default Login;