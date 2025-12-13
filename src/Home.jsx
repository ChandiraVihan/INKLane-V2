import home from './assets/home.svg'
import './Home.css';

function Home({ onClick }){
    return (
        <div className = "home-button" onClick={onClick}>
            <img src = {home} alt="Home-Button"/>
        </div>
    )
}

export default Home;