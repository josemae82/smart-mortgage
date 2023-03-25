


var mortgage = {
    "startDate": null,
    "rate": null,
    "amount": null,
    "duration": null,
    "instalments":[],
    "prepayments":[]
}

var mortgage2 = {
    "startDate": null,
    "rate": null,
    "amount": null,
    "duration": null,
    "instalments":[{
        "amount": null,
        "interest":null,
        "date": null,
        "total": null,
        "prepayment":null
    }],
    "prepayments":[{ 
        "date": null, 
        "amount": null
    }]
}


module.exports = mortgage;
