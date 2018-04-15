'use strict';

import $ from 'jquery';
import Mustache from 'mustache';
let actualData = []

$(() => {
  let total_price = 0
  let currency
  let createEditData = obj => { 
    $.each(obj.productsInCart, (index, ob) => {
      total_price = total_price + parseInt(ob.p_price);
      currency = ob.c_currency;
      obj.productsInCart[index]['editData'] = JSON.stringify({
        p_id: ob.p_id,
        p_available_options: ob.p_available_options,
        p_name: ob.p_name,
        p_price: ob.p_price,
        p_img: ob.p_img,
        c_currency: ob.c_currency,
        p_quantity: ob.p_quantity,
        p_editView: true  
      }); 
    }); 
    return obj;
  }

  const updateCheckoutDetails = actualData => {
    let cartLength = 0;
    $.each(actualData.productsInCart, (key, value) => {
      cartLength += value.p_quantity;
    })

    let discount = 0
    let shipping = total_price >= 50 ? 0 : 5

    if (cartLength === 3) {
      discount = 5
    }
    else if (cartLength > 3 && cartLength <= 6) {
      discount = 10
    }
    else if (cartLength >= 10) {
      discount = 25
    }
    else {
      $('.discount-section').addClass('hidden');
    }

    const grandTotal  = (shipping + total_price - ( total_price * discount / 100 )).toFixed(2)
    shipping = shipping === 0 ? 'FREE' : shipping
    
    $('.total-amount').html(`${currency}${total_price}`)
    $('.discount').html(`-${currency}${discount}%`)
    $('.shipping').html(`${shipping}`)
    $('.grand-total').html(`${currency}${grandTotal}`)
  }

  const loadUser = () => {
    $.get('data/data.json', () => { })
      .done((data) =>
        $.get('templates/template.mst', (template) => {
          actualData = data; 
          actualData = createEditData(actualData)
          const rendered = Mustache.render(template, actualData)
          $('#target').html(rendered)
          
          updateCheckoutDetails(actualData)
        }).fail(() => console.error('template not found'))
      )
      .fail(() => console.error('data not found'))
  }
  loadUser()

  const loadModel = data => { 
    $.get('templates/model.mst', (template) => {
      const rendered = Mustache.render(template, data)
      document.getElementById('model').innerHTML = rendered
      $('#model').removeClass('hidden');
    }).fail(() => console.error('template not found'))
  }

  $(document).on('click', 'a', e => {
    const $target = $(e.target);
    const event = $target.attr('class')

    switch (event) {
      case 'edit':
        var dataObj = $target.data('modalval')
        loadModel(dataObj);
        break;
      case 'close':
       $('#model').addClass('hidden')
    }
  })

  $(document).on('click', 'li.select-color', e => {
    const $target = $(e.target)
    $('.select-color').removeClass('color-selection')
    $('.color-error').addClass('hidden')
    $target.addClass('color-selection')
  })

  $(document).on('click', '#edit-cart', () => {
    const quantity = $('.quantity').find(":selected").text()
    const sizes = $('.sizes').find(":selected").text()
    const code = $('.sizes').find(":selected").val()
    const selectedColor = $('.select-color.color-selection').data('title')
    const selectedColorCode = $('.select-color.color-selection').data('value')
    const id = $('#product-id').val()

    if(sizes === 'Size') {
      $('.size-error').removeClass('hidden');
      return false;
    }
    if(!selectedColor) {
      $('.size-error').addClass('hidden');
      $('.color-error').removeClass('hidden');
      return false;
    }

    $.each(actualData.productsInCart, ( key, value ) => {
      if(value.p_id === id) {
        value.p_selected_size.name = sizes
        value.p_selected_size.code = code
        value.p_selected_color.name = selectedColor
        value.p_selected_color.hexcode = selectedColorCode
        value.p_quantity = parseInt(quantity)
        return false;
      }
    })

    $.get('templates/template.mst', (template) => {
      const rendered = Mustache.render(template, actualData)
        $('#target').html(rendered)
        $('#model').addClass('hidden')
        updateCheckoutDetails(actualData)
    }).fail(() => console.error('template not found'))
  })
});