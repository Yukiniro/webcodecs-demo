function ImageDecoderView(props: { onBack: () => void }) {
  const { onBack } = props;
  return (
    <div>
      <button className="btn btn-primary" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default ImageDecoderView;
