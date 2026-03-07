

import { useContext } from "react";
import DarkLogo from "/src/assets/images/logos/Esfita-Logo.png";
import LightLogo from "/src/assets/images/logos/Esfita-Logo_Dark.png";
import { Link } from "react-router";
import { CustomizerContext } from "src/context/CustomizerContext";
const FullLogo = () => {
  const {activeMode}  = useContext(CustomizerContext);
  return (
    <Link to={"/"}>
      {activeMode ==="light"?<img src={DarkLogo} alt="logo" className="block mx-auto w-35" />:<img src={LightLogo} alt="logo" className="block mx-auto w-50" />}
    </Link>
  );
};

export default FullLogo;
