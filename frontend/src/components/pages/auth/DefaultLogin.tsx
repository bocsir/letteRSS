import { FormEvent } from "react";
import api from "../../../api";

//button and <p>default login</p>

const DefaultLogin = () => {

    const useDefaultLogin = async(e: FormEvent) => {
        e.preventDefault();
        try {
          const response = await api.post('/auth/login', { email: 'example@email.com', password: 'asdfgh' });
          console.log("password valid: ", response.data.valid, ", query failed: ", response.data.queryFailed, ", response: ", response);
          //successful login
          if (response.data.valid && !response.data.queryFailed) {
            window.location.href = "/";
          }
        } catch (err) {
          console.error('login failed: ', err);
        }
      }
    
    return (
        <div className="text-sm text-neutral-300 relative z-10 p-3 pt-2 -mb-2">
            <p>Or, try it without an account:</p>
            <div className="flex justify-center">
                <button onClick={useDefaultLogin} className="border-b w-fit hover:border-yellow-300  hover:text-yellow-300 transition-all duration-150">default login</button>
            </div>
        </div>
    );
}

export default DefaultLogin;