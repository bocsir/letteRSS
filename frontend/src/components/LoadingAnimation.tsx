interface LoadingAnimation {
    isLoading: Boolean;
}

const LoadingAnimation: React.FC<LoadingAnimation> = ({ isLoading }) => {
    return (
        isLoading && (
            <div className="absolute flex top-0 left-0 justify-center items-center z-50 w-[100vw] h-[100vh] backdrop-blur-[2px]" >
                <div className="flex flex-row gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-.5s]"></div>
                </div>
            </div>

        )

    );
}

export default LoadingAnimation