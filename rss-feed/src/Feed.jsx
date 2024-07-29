const Feed = ({ title, link, date }) => {
    let formattedDate = { day:"numeric", month:"long", year:"numeric" }
    let articleDate = new Date(date).toLocaleDateString("en-US", formattedDate);
    return (
        <>
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 relative z-10">
            <h3 className="text-lg mb-1">{title}</h3>
            <p>{articleDate}</p>
        </a>
        </>
    );
}

export default Feed