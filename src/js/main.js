'use strict';

import $ from 'jquery';
import Mustache from 'mustache';

$(() => {
  let total_price = 0;
  let currency;
  let createEditData = obj => { 
    $.each(obj.productsInCart, (index, ob) => {
      total_price = total_price + parseInt(ob.p_price);
      currency = ob.c_currency;
      obj.productsInCart[index]['editData'] = JSON.stringify({
        p_available_options: ob.p_available_options,
        p_name: ob.p_name,
        p_price: ob.p_price,
        p_img: ob.p_img  
      }); 
    }); 
    return obj;
  }

  const loadUser = () => {
    $.get('data/data.json', () => { })
      .done((data) =>
        $.get('templates/template.mst', (template) => {
          data = createEditData(data); 
          const rendered = Mustache.render(template, data)
          $('#target').html(rendered)
          $('.total-amount').html(`${currency}${total_price}`)
        }).fail(() => console.error('template not found'))
      )
      .fail(() => console.error('data not found'))
  }
  loadUser()

  const loadModel = data => { 
    $.get('templates/model.mst', (template) => {
      const rendered = Mustache.render(template, data);
      document.getElementById('model').innerHTML = rendered;
      $('#model').removeClass('hidden');
    }).fail(() => console.error('template not found'))
  }

  $(document).on('click', 'a', e => {
    const $target = $(e.target);
    const event = $target.attr('class');

    switch (event) {
      case 'edit':
        var dataObj = $target.data('modalval')
        loadModel(dataObj);
        break;
      case 'close':
      $('#model').addClass('hidden');
    }
  })
});