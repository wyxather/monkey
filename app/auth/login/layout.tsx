export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className='flex flex-col items-center justify-center w-full h-full'>
      <div className='flex items-center justify-center w-2/3'>{children}</div>
    </section>
  )
}
