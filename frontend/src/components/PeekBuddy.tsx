export function PeekBuddy() {
  return (
    <div aria-hidden="true" className="peek-buddy">
      <div className="peek-buddy-ear peek-buddy-ear-left" />
      <div className="peek-buddy-ear peek-buddy-ear-right" />
      <div className="peek-buddy-face">
        <span className="peek-buddy-eye" />
        <span className="peek-buddy-eye" />
      </div>
      <div className="peek-buddy-nose" />
    </div>
  );
}
