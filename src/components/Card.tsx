function Card(props: { title: string; onClick: () => void }) {
  const { title, onClick } = props;
  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={onClick}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
