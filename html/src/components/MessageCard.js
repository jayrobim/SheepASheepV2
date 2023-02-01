const MessageCard = ({ type, msg }) => {
  return (
    <>
      {type === "error" ? (
        <div className="text-red-600">{msg}</div>
      ) : (
        <div className="text-emerald-600">{msg}</div>
      )}
    </>
  );
};

export default MessageCard;
