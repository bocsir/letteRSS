import { useEffect } from 'react';
import whiteLogo from '../assets/images/white-rss-logo.svg';    //0
import yellowLogo from '../assets/images/yellow-rss-logo.svg';  //1
import grayLogo from '../assets/images/gray-rss-logo.svg';      //2

interface LogoProps {
    color: number;
}

export const Logo: React.FC<LogoProps> = ({color}) => {

    const logos = [whiteLogo, yellowLogo, grayLogo];

    //favicon
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = yellowLogo;
        document.head.appendChild(link);
      }, []);

    return (
        <div className="flex gap-2 items-center">
            <h2 className="text-2xl">LetteRSS</h2>
            <img 
                src={logos[color]} alt="LetteRSS logo"
                className="h-8 w-8"
            />
        </div>
    );

}