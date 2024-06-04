import "server-only";

export default async function LoginLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      {props.children}
    </div>
  );
}
