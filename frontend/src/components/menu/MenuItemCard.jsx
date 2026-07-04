export default function MenuItemCard({ item, onAdd, onUpdateQuantity, quantity }) {
  return (
    <div className="bg-white rounded-lg p-md shadow-sm border border-outline-variant/10 flex gap-md relative overflow-hidden group active:scale-[0.98] transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-xs mb-xs">
          <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${item.food_type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${item.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
          </div>
          {item.is_popular && <span className="bg-tertiary-fixed text-on-tertiary-fixed px-sm py-[2px] rounded-full text-[10px] font-bold uppercase tracking-tight">Popular</span>}
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface">{item.name}</h3>
        <p className="text-on-surface-variant text-label-sm font-label-sm mt-xs line-clamp-2">{item.description}</p>
        <div className="mt-md flex items-center justify-between">
          <span className="font-bold text-on-surface-variant text-body-lg">₹{item.price}</span>
          
          {quantity > 0 ? (
            <div className="flex items-center bg-primary-fixed/30 rounded-full p-1">
              <button onClick={() => onUpdateQuantity(item.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[18px]">remove</span></button>
              <span className="px-md font-bold text-primary">{quantity}</span>
              <button onClick={() => onUpdateQuantity(item.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[18px]">add</span></button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-md shadow-sm hover:bg-primary-container transition-colors">Add</button>
          )}
        </div>
      </div>
      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url}')` }}></div>
      </div>
    </div>
  )
}
