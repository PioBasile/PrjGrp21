const PlayerList = ({ listBoutons}) => {
    // console.log("listbouton")
    // console.log(listBoutons);
    return (
        <div class="list-bouton-container">
            {listBoutons.map((bouton,index) => (
                <p1 key={index}>Server {bouton}</p1>
            ))}
        </div>
    );
};

export default PlayerList;