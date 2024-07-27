const Feed = ({ title, link, date }) => {
    let formattedDate = { day:"numeric", month:"long", year:"numeric" }
    let articleDate = new Date(date).toLocaleDateString("en-US", formattedDate);
    return (
        <>
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
            <h3 className="text-xl mb-1">{title}</h3>
            <p>{articleDate}</p>
        </a>
        </>
    );
}

export default Feed