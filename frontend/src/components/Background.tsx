import grayLogo from '../assets/images/gray-rss-logo.svg';      

const Background = () => {
    return (
        <>
        <div className="absolute top-0 w-screen h-screen flex items-center justify-center -z-10">
        <img 
                src={grayLogo} alt="LetteRSS logo"
                className="hidden md:block h-[600px] w-[600px] ml-96"
            />
        </div>
        </>
    )
}

export default Background;