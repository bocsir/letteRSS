import { useEffect } from 'react';
import yellowLogo from '../assets/images/yellow-rss-logo.svg';
import whiteLogo from '../assets/images/white-rss-logo.svg';

interface LogoProps {
    isWhite: boolean;
}

export const Logo: React.FC<LogoProps> = ({isWhite}) => {

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
                src={(isWhite) ? whiteLogo : yellowLogo} alt="LetteRSS logo"
                className="h-8 w-8"
            />
        </div>
    );

}