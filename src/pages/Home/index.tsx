import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import './styles.css';
import logo from '../../assets/logo.svg';
import {Link } from 'react-router-dom';

const Home = () =>{
    return(
        <div id="page-home">
            <div className="content">
                <header>
                <img src={logo} alt="Ecoleta"></img>
                </header>

                <main>
                    <h1>
                        Your markeplace of collecting residue
                    </h1>
                    <p>We help people to find collecting points in an eficient way</p>
                    <Link to="/create-point">
                        <span>
                            <FiLogIn/>
                        </span>
                        <strong>Add a new collection point</strong>
                    </Link>
                </main>

                
            </div>
        </div>
    
    )

}

export default Home;