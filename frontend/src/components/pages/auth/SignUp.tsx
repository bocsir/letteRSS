import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import grid from "../../../assets/images/grid.jpg";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../Logo";
import api from "../../../api";
import DefaultLogin from "./DefaultLogin";

const SignUp = () => {
  const [eyeIcon, setEyeIcon] = useState(faEye);
  const [passVis, setPassVis] = useState("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailFormatValid, setEmailFormatValid] = useState<boolean>(true);
  const [passwordValid, setPasswordValid] = useState<boolean>(true);

  const [showBackendError, setShowBackendError] = useState<boolean>(false);
  // const [isLogin, setIsLogin] = useState(false);

  const togglePasswordVis = () => {
    console.log(eyeIcon);
    if (eyeIcon.iconName === "eye") {
      setEyeIcon(faEyeSlash);
      setPassVis("text");
    } else {
      setEyeIcon(faEye);
      setPassVis("password");
    }
  };

  const validateEmail = (email: string): boolean => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = re.test(String(email).toLowerCase());
    setEmailFormatValid(valid);
    return valid;
  };

  const validatePassword = (password: string): boolean => {
    const valid = password.length >= 5;
    setPasswordValid(valid);
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const goodPw = validatePassword(password);
    const goodEmail = validateEmail(email);
    if (goodPw && goodEmail) {
      try {
        //call /signup endpoint to put email and hashed password into database
        await api.post("/auth/signup", {
          email,
          password,
        });

        //automatically try to log user in
        console.log('loggin user in automatically');
        try {
          //generate access token and refresh token
          const response = await api.post("/auth/login", {
            email: email,
            password: password,
          });
          console.log(
            "password valid: ",
            response.data.valid,
            ", query failed: ",
            response.data.queryFailed,
            ", response: ",
            response
          );
          //successful login
          if (response.data.valid) {
            //replace with useNav
            window.location.href = "/";
          }
        } catch (err) {
          console.error("login failed: ", err);
        }
      } catch (err) {
        console.error("signup failed: ", err);
        setShowBackendError(true);
      }
    }
  };
  return (
    <>
      <div className="flex flex-col sm:justify-center items-center relative w-screen h-screen">
        <img
          src={grid}
          className="w-screen h-screen absolute inset-0 object-cover object-center opacity-30"
        />
        <Link
          to="/"
          className="absolute top-0 p-3 shadow-[0px_0px_3px_1px_rgb(255,255,255)] bg-black w-screen"
        >
          <Logo isWhite={false} />
        </Link>
        {showBackendError && (
            <div className="w-[400px] mb-3 text-sm text-red-500 bg-black relative z-10 shadow-[0px_0px_3px_3px_#681d1d] rounded-md p-3 pt-2 mt-2">
              Sorry, there was a server error creating your account. If you alrady have one, please{" "}
              <Link className="underline decoration-solid text-white" to="/login">
                login here.
              </Link>
              {" "} If you dont, please try again.
            </div>
          )}

        <div className="mt-36 sm:mt-0 pl-8 pr-8 flex flex-col items-center h-max w-[400px] bg-black border rounded-lg text-white p-4 relative z-10">
          <h1 className="text-3xl text-center">Create your account</h1>
          {!showBackendError && (
            <span className="text-sm">
              Already have one?{" "}
              <Link className="underline decoration-solid" to="/login">
                login
              </Link>
            </span>
          )}

          <form className="flex flex-col h-5/6 w-full text-lg mt-2 [&>input]:mb-4 [&>input]:text-black [&>input]:pl-1 [&>input]:rounded-sm text-left">
            <label htmlFor="email">Email:</label>
            {!emailFormatValid && (
              <span className="text-red-500 text-sm -mt-1">
                Invalid email format
              </span>
            )}
            <input
              className={`border ${
                emailFormatValid ? "border-transparent" : "border-red-500"
              }`}
              type="text"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password:</label>
            {!passwordValid && (
              <span className="text-red-500 text-sm -mt-1">
                Password too short
              </span>
            )}
            <span className="flex justify-between h-min items-center mb-4">
              <input
                className={`border ${
                  passwordValid ? "border-transparent" : "border-red-500"
                } w-11/12 text-black pl-1 rounded-sm`}
                type={passVis}
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <FontAwesomeIcon
                className="cursor-pointer w-6 mr-2 ml-2"
                onClick={togglePasswordVis}
                icon={eyeIcon}
              />
            </span>
            <div className="w-full flex justify-center">
              <input
                className="bg-amber-300 w-min p-3 mt-3 mb-2 rounded-lg leading-3 cursor-pointer text-stone-800 font-bold transition-shadow duration-200 ease-in-out hover:shadow-[0px_0px_10px_4px_rgb(147,91,9)] hover:text-amber-800"
                type="submit"
                value="Submit"
                onClick={handleSubmit}
              />
            </div>
          </form>
          <DefaultLogin />
        </div>
      </div>
    </>
  );
};

export default SignUp;
