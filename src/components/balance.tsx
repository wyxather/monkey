function getClassName(balance: number) {
  if (balance < 0) return 'text-red-400'
  if (balance > 0) return 'text-green-400'
  return 'text-gray-500'
}

function formatToCurrency(balance: number) {
  return balance.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
  })
}

function seperateSymbolFromCurrency(currency: string) {
  const regex = /^(\D*)(.*)/
  const regexResult = regex.exec(currency)
  if (regexResult === null) return { symbol: '[]', value: '0' }
  return { symbol: regexResult[1], value: regexResult[2] }
}

export function Balance(props: { balance: number }) {
  const { symbol, value } = seperateSymbolFromCurrency(
    formatToCurrency(props.balance)
  )
  return (
    <div className={getClassName(props.balance)}>
      <span>{symbol}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )
}
