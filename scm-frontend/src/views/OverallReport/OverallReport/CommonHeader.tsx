import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Tooltip} from "flowbite-react";
interface CommonHeaderProps {
  title: string;
  icon: React.ReactNode;
  showBack?: boolean;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  icon,
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full mb-2 mt-2 sm:mb-3">
      <div className="flex items-center justify-between 
                      text-white p-1 sm:p-3 md:p-3 shadow-xl 
                      bg-gradient-to-r from-blue-600 to-blue-700 
                      dark:from-blue-700 dark:to-blue-800 
                      rounded-2xl">

        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <h1 className="text-md sm:text-xl text-white md:text-xl font-semibold truncate">
            {title}
          </h1>
        </div>

        {/* Right: Back Button */}
        {showBack && (
          <Tooltip content='Back'>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 
                       px-2 py-2 rounded-full 
                       bg-white/10 hover:bg-white/20 
                       transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button></Tooltip>
        )}
      </div>
    </div>
  );
};

export default CommonHeader;
