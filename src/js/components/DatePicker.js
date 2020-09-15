/* global flatpickr */

import BaseWidget from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value); // creating Date object with data of NOW;
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    //console.log(thisWidget.maxDate);

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      onChange: function(dateStr) {
        //console.log(new Date(dateStr));
        //thisWidget.value = new Date(dateStr);
        thisWidget.value = dateStr;
        console.log(thisWidget.value);
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      }
    });
  }

  parseValue(value){
    return value;
  }

  isValid(value){
    return value == value;
  }

  renderValue(){
    // const thisWidget = this;
    //
    // console.log(thisWidget.value);
  }
}

export default DatePicker;
