import './Card.css';

function Card({ title, text, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default Card;
