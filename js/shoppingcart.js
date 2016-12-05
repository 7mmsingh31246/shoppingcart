//ShopingCart.js 1.0.1
ShopingCart = (function(){
var self = this, options, model;
/**
 * Extend default options by settings parameter.
 */
var defaults = { 
	jsonurl:"cart.json",
	element : "",
	template : "",
};
/**
 * Create Element Selector.
 */
var el = function(selector){ 
	var elements = document.querySelectorAll(selector);
	var length = elements.length;
	var fc = function(){
		return this;
	}
	fc.get = function(index){
		if(typeof html==='string'){
			return typeof elements[index]!=='undefined'?elements[index]:[];
		}else{
			return elements[0]
		}
	}
	fc.html = function(html){
		//html = String(html);
		if(typeof html==='string'){
			if(length>0){
				elements[0].innerHTML = html;
			}
		}else{
			if(length>0){
				return String(elements[0].innerHTML); 
			}else{
				return String();
			}
		}
	}
	fc.empty = function(){
		if(length>0){
			elements[0].innerHTML = ""; 
		}
	}
	fc.on = function(evt,cb){		
		if(length>0){
			elements.forEach(function(element,index){
				element.addEventListener(evt, cb ,null);
			}); 
		}
		return fc;
	}
	return fc;
} 
/**
 * Define cart object.
 */
var config = {
	"items":[],
	"currency" : "$",
	"freeshippingover" : 50,
	"shipping" : {
		"price" : 0
	},
	"subtotal" : 0,
	"total" : 0,
	"promo" : {
		"code":"JF10",
		"value":5.00
	}
};
/**
 * Define promo codes for cart.
 */
this.promoCodes =[
	{
		   "code":"JF10",
		   "value":5.00
	},{
		   "code":"JF11",
		   "value":10.00
	}
];
/**
 * Get JSON feeds.
 */
this.loadJSON = function (url,callback) {  
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
          }
    };
    xobj.send(null);  
}
/**
 * Get all promo codes to cart object.
 */
this.getPromoCodes = function(){ 
	return this.promoCodes;
}
/**
 * Validate promo code.
 * @param {string} code - The promo code.
 */
this.validatePromoCode = function(code){ 
	var index =  _.findIndex(this.promoCodes,{"code":code});
	return index>-1?true:false;
}
/**
 * Applying promo code.
 * @param {string} code - The promo code.
 */
this.applyPromoCode = function(code){ 
	var index =  _.findIndex(this.promoCodes,{"code":code});
	var promo =  _.find(this.promoCodes,{"code":code});
	if(promo){
		self.cart.promo = promo;
		self.calculateTotals();	
	}
}
/**
 * Get cart object.
 */
this.getCart = function(){ 
	return self.cart;
}
/**
 * Get cart object.
 * @param {string} id - The id of product in cart items.
 */
this.getCartItem = function(id){ 
	return _.find(self.cart.items,{"p_id":id});
}
/**
 * Update cart item.
 * @param {string} id - The product ID of product in cart items.
 * @param {string} product - The product.
 */
this.updateCartItem = function(product){ 
	var product_key = _.findIndex(self.cart.items,{"p_id":product.p_id});
	if(product_key>-1){
		self.cart.items[product_key] = product;
		self.calculateTotals();	
	}
	return self.cart;
}
/**
 * Remove cart item from cart.
 * @param {string} id - The product ID of product in cart items.
 */
this.removeCartItem = function(id){
	var cartItem = this.getCartItem(id);
	if(self.cart.items.indexOf(cartItem)>-1){
		self.cart.items.splice(self.cart.items.indexOf(cartItem),1);
		self.calculateTotals();	
	}
	return self.cart;
}
/**
 * Add item to cart.
 */
this.addCartItem = function(){ 
	return self.cart;
}
/**
 * Update cart item quantity.
 * @param {string} id - The product ID of product in cart items.
 * @param {string} qty - The quantity of product in cart items.
 */
this.updateCartItemQuantity = function(id,qty){ 
	var cartItem = this.getCartItem(id);
	if(self.cart.items.indexOf(cartItem)>-1){
		cartItem["p_quantity"] = qty;
		self.calculateTotals();	
	}
	return self.cart;
}
/**
 * Update cart item color.
 * @param {string} id - The product ID of product in cart items.
 * @param {string} color - The color of product in cart items.
 */
this.updateCartItemColor = function(id,colorName){ 
	var cartItem = this.getCartItem(id);
	var color = _.find(cartItem.p_available_options.colors,{'name':colorName}); 
	if(typeof color!=="undefined"){
		cartItem["p_selected_color"] = color; 
	}
	return self.cart;
}
/**
 * Update cart item size.
 * @param {string} id - The product ID of product in cart items.
 * @param {string} size - The size of product in cart items.
 */
this.updateCartItemSize = function(id,code){ 
	var cartItem = this.getCartItem(id);
	var size = _.find(cartItem.p_available_options.sizes,{'code':code});
	if(typeof size!=="undefined"){
		cartItem["p_selected_size"] = size; 
	}
	return self.cart;
}
/**
 * Calculate cart totals and displaying.
 */
this.calculateTotals = function(){ 
	var subTotal = 0;
	self.cart.items.forEach(function(item,index){
		subTotal += (item["p_quantity"]*item["p_price"]);
	});
	self.cart.subtotal = subTotal;
	if(subTotal>self.cart.freeshippingover){
		self.cart.shipping.price = 0;
	}else{
		self.cart.shipping.price = 100;
	}
	self.cart.total = self.cart.subtotal - self.cart.promo.value + self.cart.shipping.price;
	self.applyTemplate();	
}
/**
 * Load Cart Template.
 */
this.loadTemplate = function(){
	return el(options.template).html();
}
/**
 * Applying Template.
 */
this.applyTemplate = function(){
	var template = self.loadTemplate();  
	var tpl = _.template(template)(self.cart);
	el(options.element).html(tpl);
	self.bindEvents();
}
/**
 * Bind Events to elements.
 */
this.bindEvents = function(){
	el('.qty').on("keyup",function(event){
			this.value = this.value.replace(/\D+/,'');
	}).on("blur",function(event){		
		event.preventDefault();
		var qty = this.value;
		var id = this.getAttribute('data-product-id'); 
		self.updateCartItemQuantity.call(self,id,qty);
		return false;
	}); 
	el('.link-edit').on("click", function(event){		
		event.preventDefault();
		var id = this.getAttribute('data-product-id'); 
		model.show.call(self,id);
		return false;
	});
	el('.link-remove').on("click", function(event){		
		event.preventDefault();
		var id = this.getAttribute('data-product-id');
		self.removeCartItem.call(self,id);
		return false;
	});
	el('#promoform').on("submit", function(event){	
		event.preventDefault();
		var promoCode = this.promo.value;
		if(self.validatePromoCode(promoCode)){
			self.applyPromoCode.call(self,promoCode)
			this.promo.parentNode.removeAttribute("data-invalid");
		}else{ 
			var msg = "Promo code is not valid.";
			this.promo.parentNode.setAttribute("data-invalid",msg);
		}
	});
}
model = {
	show: function(id){ 
		model.product = self.getCartItem(id);
		model.loadTemplate.call(self); 	
	},
	hide: function(){
		el(options.model.container).empty();
	},
	updateOption: function(key,optionName,optionKey,optionValue){ 
		
		var p_options = model.product.p_available_options[key];
		var search_param = {}; 
		search_param[""+optionKey+""] = optionValue;
		var p_option = _.find(p_options,search_param); 
		if(typeof p_option!=="undefined"){
			model.product[optionName] = p_option;
			model.loadTemplate.call(self); 	
		}
	},
	loadTemplate: function(){ 
		var template = el(options.model.template).html();  
		var tpl = _.template(template)({product:model.product}); 
		el(options.model.container).html(tpl);
		model.bindEvents.call(self); 
		
	},
	bindEvents: function(product){ 
		el('.model-close').on("click", function(event){		
			event.preventDefault(); 
			model.hide.call(self); 
		});
		el('.model-overlay').on("click", function(event){		
			event.preventDefault(); 
			model.hide.call(self); 
		});
		el('.product-color').on("click", function(event){	 
			var color = this.value;
			var id = this.getAttribute('data-product-id');
			model.updateOption.call(self,'colors','p_selected_color','name',color); 	
		});
		el('.product-size').on("click", function(event){	 
			var code = this.value;
			var id = this.getAttribute('data-product-id');
			model.updateOption.call(self,'sizes','p_selected_size','code',code); 	
		});
		el('.btn-product-update').on("click", function(event){	 
			model.applyProduct.call(self); 
			model.hide.call(self); 
		});
	},
	applyProduct: function(){
		self.updateCartItem(model.product);
	}
}
/**
 * Constructor method.
 */
return function(settings){
	options = _.extend(defaults, settings);
	self.loadJSON(options.jsonurl, function(data){ 
		if(data.productsInCart)
			config.items = data.productsInCart;
		self.cart = config;	  
		self.calculateTotals();
	})
	return {
		updateTotals: function(){self.calculateTotals()},
		cart:self.cart
	};
};
}())
