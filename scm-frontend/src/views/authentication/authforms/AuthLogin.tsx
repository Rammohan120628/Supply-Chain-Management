// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import axios from "axios";
// import {
//   HiOutlineMail,
//   HiOutlineLockClosed,
//   HiOutlineEye,
//   HiOutlineEyeOff,
// } from "react-icons/hi";

// import kelvinLogo from "src/assets/images/logos/EsfitaNew.png";

// const AuthLogin = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const loginUrl = "http://43.254.31.234:9070/login-service-scm/auth/login";

//     const loginData = {
//       email: email,
//       password: password,
//     };

//     try {
//       const response = await axios.post(loginUrl, loginData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         const { token, userId, purchasePeriod,stockPeriod,entityEiis ,tokenExpire} = response.data.data;

//         // Store all necessary data in localStorage
//         localStorage.setItem("authToken", token);
//         localStorage.setItem("userId", userId);
//         localStorage.setItem("purchasePeriod", purchasePeriod);
//    localStorage.setItem("stockPeriod", stockPeriod); 
//            localStorage.setItem("validity",tokenExpire)
//         localStorage.setItem("entity", entityEiis?.entity || "");
//         localStorage.setItem("currencyId", entityEiis?.currencyId || "");
//         localStorage.setItem("interestRate", entityEiis?.interestRate?.toString() || "");
//         localStorage.setItem("entityName", entityEiis?.entityName || "");

//         console.log("Token stored in localStorage:", token);
//         console.log("User ID stored in localStorage:", userId);
//         console.log("Entity data stored:", entityEiis);

//         // Navigate to PurchaseOrderCreation with state data
//         navigate("/LocationRequest", { 
//           state: {
//             entity: entityEiis?.entity,
//             currencyId: entityEiis?.currencyId,
//             interestRate: entityEiis?.interestRate,
//             entityName: entityEiis?.entityName
//           }
//         });
//       } else {
//         setError(response.data.message || "Login failed. Please try again.");
//       }
//     } catch (err: any) {
//       setError("An error occurred during login. Please check your credentials.");
//       console.error("Login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-1 ml-30">
//       {/* Logo */}
//       <div className="flex justify-center ml-30">
//         <img
//           src={kelvinLogo}
//           alt="Esfita Logo"
//           className="h-20 w-[190px] object-contain"
//         />

//       </div>
//   <h3 className="text-4xl whitespace-nowrap font-bold text-gray-900 mb-8 ml-30">Welcome Back</h3>
//       {/* Title */}


//       {/* Form */}
//       <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
//         {/* Email */}
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//             Login Id
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiOutlineMail className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter Your Email Id"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="block w-[420px] pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  0 transition"
//             />
//           </div>
//         </div>

//         {/* Password */}
//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="block w-[420px] pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  transition"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 ml-96"
//             >
//               {showPassword ? (
//                 <HiOutlineEyeOff className="h-5 w-5" />
//               ) : (
//                 <HiOutlineEye className="h-5 w-5" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <p className="text-red-600 text-sm text-center">{error}</p>}

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-[420px] py-2 mt-4 text-white bg-blue-600 hover:bg-green-700 rounded-full font-medium shadow-md transition-transform transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//         >
//           {loading ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 />
//               </svg>
//               Signing in...
//             </>
//           ) : (
//             "Sign in"
//           )}
//         </button>
//       </form>

//       {/* Footer */}
//       <p className="mt-8 text-xs text-gray-700 ml-20">
//         © {new Date().getFullYear()} Esfita InfoTech. All rights reserved.
//       </p>
//     </div>
//   );
// };

// export default AuthLogin;



// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import axios from "axios";
// import {
//   HiOutlineMail,
//   HiOutlineLockClosed,
//   HiOutlineEye,
//   HiOutlineEyeOff,
// } from "react-icons/hi";
// import { useAuth } from "src/context/AuthContext/AuthContext";


// import kelvinLogo from "src/assets/images/logos/EsfitaNew.png";

// const AuthLogin = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();
// const {setIpAddress} = useAuth()
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const loginUrl = "http://43.254.31.234:9070/login-service-scm/auth/login";

//     const loginData = {
//       email: email,
//       password: password,
//     };

//     try {
//       const response = await axios.post(loginUrl, loginData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {

//         const { token, userId, purchasePeriod,stockPeriod,tenderPeriod,entityEiis ,tokenExpire} = response.data.data;

//         // Store all necessary data in localStorage
//         localStorage.setItem("authToken", token);
//         localStorage.setItem("userId", userId);
//         localStorage.setItem("purchasePeriod", purchasePeriod);
//         localStorage.setItem("stockPeriod", stockPeriod); 
//         localStorage.setItem('tenderPeriod',tenderPeriod)
//         console.log('Tender Period--->',tenderPeriod)
//         localStorage.setItem("validity",tokenExpire)
//         localStorage.setItem("entity", entityEiis?.entity || "");
//         localStorage.setItem("currencyId", entityEiis?.currencyId || "");
//         localStorage.setItem("interestRate", entityEiis?.interestRate?.toString() || "");
//         localStorage.setItem("entityName", entityEiis?.entityName || "");


//         console.log("Token stored in localStorage:", token);
//         console.log("User ID stored in localStorage:", userId);
//         console.log("Entity data stored:", entityEiis);



//         if(entityEiis.ipAddress){
//             setIpAddress(entityEiis.ipAddress)
//           }


//         // Navigate to PurchaseOrderCreation with state data
//         navigate("/LocationRequest", { 
//           state: {
//             entity: entityEiis?.entity,
//             currencyId: entityEiis?.currencyId,
//             interestRate: entityEiis?.interestRate,
//             entityName: entityEiis?.entityName
//           }
//         });
//       } else {
//         setError(response.data.message || "Login failed. Please try again.");
//       }
//     } catch (err: any) {
//       setError("An error occurred during login. Please check your credentials.");
//       console.error("Login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-1 ml-30">
//       {/* Logo */}
//       <div className="flex justify-center ml-30">
//         <img
//           src={kelvinLogo}
//           alt="Esfita Logo"
//           className="h-20 w-[190px] object-contain"
//         />

//       </div>
//   <h3 className="text-4xl whitespace-nowrap font-bold text-gray-900 mb-8 ml-30">Welcome Back</h3>
//       {/* Title */}


//       {/* Form */}
//       <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
//         {/* Email */}
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//             Login Id
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiOutlineMail className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter Your Email Id"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="block w-[420px] pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  0 transition"
//             />
//           </div>
//         </div>

//         {/* Password */}
//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="block w-[420px] pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  transition"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 ml-96"
//             >
//               {showPassword ? (
//                 <HiOutlineEyeOff className="h-5 w-5" />
//               ) : (
//                 <HiOutlineEye className="h-5 w-5" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <p className="text-red-600 text-sm text-center">{error}</p>}

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-[420px] py-2 mt-4 text-white bg-blue-600 hover:bg-green-700 rounded-full font-medium shadow-md transition-transform transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//         >
//           {loading ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 />
//               </svg>
//               Signing in...
//             </>
//           ) : (
//             "Sign in"
//           )}
//         </button>
//       </form>

//       {/* Footer */}
//       <p className="mt-8 text-xs text-gray-700 ml-20">
//         © {new Date().getFullYear()} Esfita InfoTech. All rights reserved.
//       </p>
//     </div>
//   );
// };

// export default AuthLogin;







import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { useAuth } from 'src/context/AuthContext/AuthContext';
import { usePermissions } from 'src/context/PermissionContext/PermissionContext'; // <-- import
import kelvinLogo from "src/assets/images/logos/EsfitaNew.png";

const AuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setIpAddress } = useAuth();
  const { refreshPermissions } = usePermissions(); // <-- get refresh function

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loginUrl = "http://43.254.31.234:9070/login-service-scm/auth/login";

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(loginUrl, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const { token, userId, userType, purchasePeriod, stockPeriod, entityEiis, tokenExpire, tenderPeriod, emailId, userName, cwhName } = response.data.data;

        // Store all necessary data in localStorage
        localStorage.setItem('userType', userType);
        localStorage.setItem('emailId', emailId);
        localStorage.setItem('userName', userName);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("purchasePeriod", purchasePeriod);
        localStorage.setItem("stockPeriod", stockPeriod);
        const cwh = entityEiis?.cwh || "";
        localStorage.setItem("cwh", cwh);
        localStorage.setItem("cwhName", cwhName);
        localStorage.setItem("tenderPeriod", tenderPeriod);
        localStorage.setItem("validity", tokenExpire);
        localStorage.setItem("entity", entityEiis?.entity || "");
        localStorage.setItem("currencyId", entityEiis?.currencyId || "");
        localStorage.setItem("interestRate", entityEiis?.interestRate?.toString() || "");
        localStorage.setItem("entityName", entityEiis?.entityName || "");
        
        if (entityEiis.ipAddress) {
          setIpAddress(entityEiis.ipAddress);
        }

        console.log("Token stored in localStorage:", token);
        console.log("User ID stored in localStorage:", userId);
        console.log("Entity data stored:", entityEiis);

        // 🔄 Refresh permissions to load the new user's sidebar
        await refreshPermissions();

        // ✅ Navigate to the empty screen (home page)
        navigate('/');
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError("An error occurred during login. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-1 ml-30">
      {/* Logo */}
      <div className="flex justify-center ml-30">
        <img
          src={kelvinLogo}
          alt="Esfita Logo"
          className="h-20 w-[190px] object-contain"
        />
      </div>
      <h3 className="text-4xl whitespace-nowrap font-bold text-gray-900 mb-8 ml-30">Welcome Back</h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Login Id
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Enter Your Email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-[420px] pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  0 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-[420px] pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300  transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 ml-96"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-[420px] py-2 mt-4 text-white bg-blue-600 hover:bg-green-700 rounded-full font-medium shadow-md transition-transform transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-700 ml-20">
        © {new Date().getFullYear()} Esfita InfoTech. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLogin;
