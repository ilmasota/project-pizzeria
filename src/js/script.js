/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();

      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      thisProduct.initAccordion();

      console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML for individual product, based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log(generatedHTML);
      /* generate DOM element based on product's code (utils.createElementFromHTML)*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container on website */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add DOM element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); // '.product__order'
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); // 'input, select'
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); // '[href="#add-to-cart"]'
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); // '.product__total-price .price'
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // '.product__images'
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); // '.widget-amount'
    }

    initAccordion(){
      const thisProduct = this;
      //console.log(thisProduct);
      /* find the clickable trigger (the element that should react to clicking) */
      const accordionTrigger = thisProduct.accordionTrigger;
      //console.log(accordionTrigger);
      /* START: click event listener to trigger */
      accordionTrigger.addEventListener('click', function(){
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* START LOOP: for each active product */
        for(let activeProduct of allActiveProducts){
          /* START: if the active product isn't the element of thisProduct */
          if (thisProduct.element !== activeProduct) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }

    initOrderForm(){
      const thisProduct = this;
      // console.log('initOrderForm');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      /* const formData - creating objects that are default */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      /* const price for default price */
      let price = thisProduct.data.price;
      //console.log(price);

      /* LOOP for each param in params - iterating over parameters */
      for(let paramId in thisProduct.data.params){
        // console.log(paramId);
        const param = thisProduct.data.params[paramId];
        //console.log(param);

        /* LOOP for each optionID in param.options - iterating over options of parameters */
        for(let optionId in param.options){
          //console.log(optionID);
          const option = param.options[optionId];
          //console.log(option);
          //console.log(option.price);

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          /* START IF: if option is selected and option is not default */
          if(optionSelected && !option.default){
            /* add price of option to variable price */
            price += option.price;
            /* END IF: if option is selected and option is not default */
            /* START ELSE IF: if option is not selected and option is default */
          } else if(!optionSelected && option.default){
            /* deduct price of option from price */
            price -= option.price;
            /* END ELSE IF: if option is not selected and option is default */
          }

          /* create const for found elements */
          const imagesClass = '.'+paramId+'-'+optionId;

          /* if/else - check if option is selected */
          if(optionSelected){
            for (let imageOption of thisProduct.imageWrapper.querySelectorAll(imagesClass)){
              imageOption.classList.add('active');
            }
          } else {
            for (let imageOption of thisProduct.imageWrapper.querySelectorAll(imagesClass)){
              imageOption.classList.remove('active');
            }
          }
          /* end LOOP for each optionID */
        }
        /* end LOOP for each paramID */
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      //console.log(thisProduct.priceElem);
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /* TODO: add validation */
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
