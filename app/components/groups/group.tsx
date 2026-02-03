"use client";

export function Group(props: { id: string }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <p>Group — {props.id}</p>
    </div>
  );
}
