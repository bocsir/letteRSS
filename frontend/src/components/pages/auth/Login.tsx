import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import grid from "../../../assets/images/grid.jpg";
import { FormEvent, useState } from "react";
import { Link } from 'react-router-dom';
import { Logo } from "../../Logo";
import DefaultLogin from './DefaultLogin';
import api from '../../../api';

interface User {
  email: string;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user: User;
}

const Login: React.FC = () => {
  const [eyeIcon, setEyeIcon] = useState(faEye);
  const [passVis, setPassVis] = useState<string>("password");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [passwordValid, setPasswordValid] = useState<boolean>(true);
  const [queryFailed, setQueryFailed] = useState<boolean>(false);

  const togglePasswordVis = () => {
    if (eyeIcon.iconName === "eye") {
      setEyeIcon(faEyeSlash);
      setPassVis("text");
    } else {
      setEyeIcon(faEye);
      setPassVis("password");
    }
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email: email, password: password });
      console.log("password valid: ", response.data.valid, ", query failed: ", response.data.queryFailed, ", response: ", response);
      if (!response.data.queryFailed) setPasswordValid(response.data.valid);
      setQueryFailed(response.data.queryFailed);
      //successful login
      if (response.data.valid && !response.data.queryFailed) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error('login failed: ', err);
    }
  }

  return (
    <>
      <div
        className="flex sm:items-center justify-center relative w-screen h-screen"
      >
        <img src={grid} className="w-screen h-screen absolute inset-0 object-cover object-center opacity-30" loading="lazy" />
        <Link to="/" className="absolute top-0 p-3 shadow-[0px_0px_3px_1px_rgb(255,255,255)] bg-black w-screen">
          <Logo isWhite={false} />
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
            {(queryFailed) && (
              <span className="text-red-500 text-sm -mt-1">
                Email not found
              </span>
            )}

            <input className={`border ${queryFailed ? "border-red-500" : "border-transparent"}`} type="text" id="email" name="email" onChange={e => setEmail(e.target.value)} />
            <label htmlFor="password">Password:</label>
            {(!passwordValid) && (
              <span className="text-red-500 text-sm -mt-1">
                Password incorrect
              </span>
            )}

            <div className="flex justify-between h-min items-center mb-4">

              <input
                className={`w-11/12 text-black pl-1 rounded-sm border ${!passwordValid || queryFailed ? "border-red-500" : "border-transparent"}`}
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
            </div>
            <div className="w-full flex justify-center">
              <input
                className="bg-amber-300 w-min p-3 mt-3 mb-2 rounded-lg leading-3 cursor-pointer text-stone-800 font-bold transition-shadow duration-200 ease-in-out hover:shadow-[0px_0px_10px_4px_rgb(147,91,9)] hover:text-amber-800"
                type="submit"
                value="Submit"
                onClick={handleSubmit}
              />
            </div>

          </form>
          <DefaultLogin/>
        </div>
      </div>
    </>
  );
};

export default Login