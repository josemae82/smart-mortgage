var express = require('express');
const { startDate } = require('../domain/mortgage');
var router = express.Router();
var mortgage = require('../domain/mortgage');

/* GET home page. */
router.get('/', function (req, res, next) {
  //console.log('index', mortgage);
  res.render('index', { mortgage });
});

router.post('/setMortgageData', function (req, res, next) {
  var m = mortgage;
  //console.log('req.body.amount',req.body)
  m[req.body.field] = req.body.value;
  res.render('index', { mortgage: m });
});



router.post('/addPrepayment', function (req, res, next) {
  //console.log('body',req.body.mortgage)
  //var m = req.body.mortgage;
  var m = mortgage;
  console.log(m);
  if (m) {
    m.prepayments.push({
      "date": getDateInFirstDayOfMonth(new Date()),
      "amount": null
    })
  }
  //console.log( 'm+', m);
  //res.status(200).send({ mortgage: m })
  //console.log(res);
  res.render('index', { mortgage: m });


  //res.send(200, { mortgage });
});

router.post('/removePrepayment', function (req, res, next) {
  //console.log('query', req.query);
  var m = mortgage;
  if (m) {
    m.prepayments[parseInt(req.query.index)] = null;
    m.prepayments = m.prepayments.filter(item => item !== null);
    //console.log( 'm-', m);
    res.render('index', { mortgage: m });
    //res.status(200).send({ mortgage: m })
    //res.send('index', { mortgage: m });
  }
});


getDateInFirstDayOfMonth = (startDate) => {
  var inputDate = new Date(startDate);
  var outputDate = inputDate.getFullYear().toString() + "-" + ("0" + (inputDate.getMonth() + 1)).slice(-2).toString() + "-01";
  //console.log('getDateInFirstDayOfMonth', startDate,  ("0" + (inputDate.getMonth() + 1)).slice(-2).toString()   , outputDate);
  return outputDate;
}

dateWithMonthsDelay = (date) => {
  const dateInFirstOfMonth = new Date(getDateInFirstDayOfMonth(date.toISOString()));
  date.setDate(dateInFirstOfMonth.getDate() + 32);

  //console.log('dateWithMonthsDelay', dateInFirstOfMonth,'-----------------' ,date, new Date(getDateInFirstDayOfMonth(date.toISOString())));

  return new Date(getDateInFirstDayOfMonth(date.toISOString()));
}


getCuotaMensual = (C, i, years) => (((C * i / 12) / [1 - Math.pow((1 + i / 12), (-12 * years))]))
getPendingAmount = (C, cuotaConstante, monthlyInterest, prepay) =>
  prepay > 0 ? ((C - prepay) * 100) / 100 : ((C - (cuotaConstante - monthlyInterest)) * 100) / 100

router.post('/calculate', function (req, res, next) {
  //console.log('reqXXX', req.body);
  var m = mortgage;
  if (m) {
    m.amount = req.body.amount;
    m.rate = req.body.rate;
    m.startDate = getDateInFirstDayOfMonth(req.body.startDate);
    m.duration = req.body.duration;
    m.prepayments = [];
    if (req.body.amount0) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date0), 'amount': req.body.amount0 });
    if (req.body.amount1) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date1), 'amount': req.body.amount1 });
    if (req.body.amount2) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date2), 'amount': req.body.amount2 });
    if (req.body.amount3) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date3), 'amount': req.body.amount3 });
    if (req.body.amount4) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date4), 'amount': req.body.amount4 });
    if (req.body.amount5) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date5), 'amount': req.body.amount5 });
    if (req.body.amount6) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date6), 'amount': req.body.amount6 });
    if (req.body.amount7) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date7), 'amount': req.body.amount7 });
    if (req.body.amount8) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date8), 'amount': req.body.amount8 });
    if (req.body.amount9) m.prepayments.push({ 'date': getDateInFirstDayOfMonth(req.body.date9), 'amount': req.body.amount9 });


  }
  m.prepayments = m.prepayments.filter(p => p.date !== undefined && p.date !== '' && p.date !== null);
  //res.send('respond with a resource');

  //console.log('CC2', m);
  //CUOTA PERIÓDICA CONSTANTE = [Ci/cuotas] / [1-(1+i/cuotas)^-cuotas*n].
  //wikipedia
  // A = C*i / (1-(1+i)^-n)
  //A(t) = A( ( (1+i)^n - (1+i)^t ) /  ( (1+i)^n -1   )  )
  const years = parseInt(m.duration);
  var cuotas = years * 12;
  var C = parseFloat(m.amount);
  const debt = parseFloat(m.amount);
  const i = parseFloat(m.rate / 100);
  var cuotaConstante = getCuotaMensual(C, i, years);
  var instalments = [];
  //var cuota=0;
  var dateOptions = { year: 'numeric', month: '2-digit', day: 'numeric' };

  var baseDate = new Date(m.startDate);
  var today = new Date();
  instalments.push({
    "month": "0", "date": baseDate.toLocaleString('us-US', dateOptions).substr(0, 10).replace(',', ''),
    "amount": "-", "interest": "-", "principal": "-", "pending": C
  });


  var totalInterest = 0;
  var totalApplied = 0;
  var yearsPast = 0;
  var contaMonths = baseDate.getMonth() + 1;
  //console.log('contaMonths', contaMonths);

  for (var j = 1; j <= cuotas; j++) {

    var newDate = j === 1 ? baseDate : dateWithMonthsDelay(newDate);
    if (contaMonths % 13 == 0) { contaMonths = 1; yearsPast++; }

    //const cuota = (C*i) / (1 - Math.pow((1+i), (-1 * j)));
    //const interest = (C*i) / (1 - Math.pow((1+i), (-1 * j)));
    //var instalment = C * ((Math.pow(1+i/12, cuotas)  - Math.pow(1+i/12, j)))  /   (Math.pow(1+i/12, cuotas) -1); 
    var monthlyInterest = ((C * i / 12) * 100) / 100;
    var pending = (C -(cuotaConstante - monthlyInterest));
    //getPendingAmount(C, cuotaConstante, monthlyInterest, 0);


    var prepay = 0;
    if (m.prepayments.length > 0) {
      const settedPrepay = m.prepayments.find(p => p.amount !== null && p.date.substr(0, 8) === newDate.toISOString().substr(0, 8));

      if (settedPrepay) {
        console.log('settedPrepay', settedPrepay);
        prepay = parseFloat(settedPrepay.amount);
        if (prepay > 0) {
          totalApplied = totalApplied + prepay;
          //const yearsRemaining = years - (yearsPast + Math.round(contaMonths / 12 * 100) / 100);
          const yearsRemaining = years - (yearsPast + (contaMonths / 12));
        

          monthlyInterest = ((C - prepay-(cuotaConstante - monthlyInterest)) * i / 12)  
          cuotaConstante = getCuotaMensual(C - prepay - (cuotaConstante - monthlyInterest), i, (yearsRemaining));
          
          pending = (C - prepay-(cuotaConstante - monthlyInterest));
          // getPendingAmount(pending, cuotaConstante, monthlyInterest, prepay);
          console.log('totalApplied', (C - prepay-(cuotaConstante - monthlyInterest)), 
          contaMonths, Math.round(contaMonths / 12 * 100) / 100,
          yearsRemaining, years, yearsPast, cuotaConstante);
        }
        //monthlyInterest += 150;
      }
    }


    const principal = parseFloat(((cuotaConstante - monthlyInterest) * 100) / 100);


    if (pending >= -100) {
      totalApplied = totalApplied + principal;
      totalInterest = totalInterest + parseFloat(monthlyInterest);
      
      instalments.push({
        "month": j.toString(),
        "date": newDate.toISOString().slice(0, 10),
        "amount": parseFloat(cuotaConstante).toFixed(2),
        "interest": parseFloat(monthlyInterest).toFixed(2),
        "principal": principal.toFixed(2),
        "totalApplied": totalApplied.toFixed(2),
        "pending": parseFloat(pending).toFixed(2),
        "prepayment": prepay === 0 ? "" : parseFloat(prepay).toFixed(2),
        "totalInterest": totalInterest.toFixed(2),
        "notes": (prepay === 0 ? "" : " comm. +150€ ") +
          (newDate.toISOString().slice(0, 7) === today.toISOString().slice(0, 7) ?
            "Paid: " + totalInterest.toFixed(2) : ""),
        "today": newDate.toISOString().slice(0, 7) === today.toISOString().slice(0, 7)
      });
    }
    C = C - (cuotaConstante - monthlyInterest) - prepay;
    pending = C;
    baseDate = newDate;
    contaMonths++;
  }
  const finalPending = parseFloat(debt - totalApplied) < 0 ? 0 : parseFloat(debt - totalApplied);
  instalments.push({
    "month": "0",
    "date": "-THE END-",
    "amount": "",
    "interest": parseFloat(totalInterest).toFixed(2),
    "principal": totalApplied.toFixed(2),
    "pending": finalPending.toFixed(2),
    "prepayment": "",
    "totalInterestWithoutPrepayments": totalInterest.toFixed(2),
    "notes": "",
    "today": false
  });

  instalments.sort((a, b) => parseInt(a.month) < parseInt(b.month) ? -1 : 1)

  //console.log('cuota', cuotaConstante, instalments);
  m.instalments = instalments;
  //console.log('EXIT',totalApplied.toFixed(2), totalInterest.toFixed(2)) ;
  //res.status(200).send({ mortgage: m })
  res.render('index', { mortgage: m });
  //next();
});

module.exports = router;
