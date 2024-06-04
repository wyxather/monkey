import "server-only";

export default async function RegisterLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      {props.children}
    </div>
  );
}
