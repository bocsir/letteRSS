import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import grid2 from "../../assets/images/grid-bg_4x.webp";
import { FormEvent, useState } from "react";
import {Link} from 'react-router-dom';
import { Logo } from "../Logo";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [eyeIcon, setEyeIcon] = useState(faEye);
  const [passVis, setPassVis] = useState<string>("password");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [passwordValid, setPasswordValid] = useState<boolean>(true);
  const [queryFailed, setQueryFailed] = useState<boolean>(false);
  // const [isLogin, setIsLogin] = useState(false);

  const togglePasswordVis = () => {
    if (eyeIcon.iconName === "eye") {
      setEyeIcon(faEyeSlash);
      setPassVis("text");
    } else {
      setEyeIcon(faEye);
      setPassVis("password");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/login", {
        email,
        password,
      })
      .then((res) => {
        console.log("password valid: ", res.data.valid , ", query failed: ", res.data.queryFailed, ", response: ", res);
        setPasswordValid(res.data.valid);
        setQueryFailed(res.data.queryFailed);
        //successful login
        if(passwordValid && !queryFailed) {
          localStorage.setItem('userToken', res.data.token);
          localStorage.setItem('userEmail', email);

          window.location.href="/dashboard";
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div
        className="flex sm:items-center justify-center relative w-screen h-screen"
      >
        <img src={grid2} className="w-screen h-screen absolute inset-0 object-cover object-center opacity-30"/>
        <Link to="/" className="absolute top-0 p-3 shadow-[0px_0px_3px_1px_rgb(255,255,255)] bg-black w-screen">
          <Logo isWhite={false}/>
        </Link>
        <div className="mt-36 sm:mt-0 pl-8 pr-8 flex flex-col items-center h-max w-[400px] bg-black border rounded-lg text-white p-4 relative z-10">
          <h1 className="text-3xl text-center">Login to your account</h1>
          <span className="text-sm">
            Don't have one?{" "}
            <Link className="underline decoration-solid" to="/signup">
              sign up
            </Link>
          </span>

          <form
            className="flex flex-col h-5/6 w-full text-lg mt-2 [&>input]:mb-4 [&>input]:text-black [&>input]:pl-1 [&>input]:rounded-sm text-left">
            <label htmlFor="email">Email:</label>
            <input className={`border ${queryFailed ? "border-red-500" : "border-transparent"}`} type="text" id="email" name="email" onChange={e => setEmail(e.target.value)}/>
            <label htmlFor="password">Password:</label>
            <span className="flex justify-between h-min items-center mb-4">
              <input
                className={`w-11/12 text-black pl-1 rounded-sm border ${passwordValid ? "border-transparent" : "border-red-500"}`}
                type={passVis}
                id="password"
                name="password"
                onChange={e => setPassword(e.target.value)}
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
        </div>
      </div>
    </>
  );
};

export default Login