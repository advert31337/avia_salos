
// Сперва получение данных
const API_KEY = 'd544ed794d34d8406e53f57fd43828f5';
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json';
const calendar = 'http://min-prices.aviasales.ru/calendar_preload';
// const citiesApi = 'db/cities.json';
const proxy = 'https://cors-anywhere.herokuapp.com/';
const MAX_COUNT = 10;

let city = [];

// Потом переменные
const formSearch = document.querySelector('.form-search');
const inputCitiesFrom = formSearch.querySelector('.input__cities-from')
const inputCitiesTo = formSearch.querySelector('.input__cities-to')
const dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from')
const dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to')
const inputDateDepart = formSearch.querySelector('.input__date-depart')
const cheapestTicket = document.getElementById('cheapest-ticket');
const otherCheapTickets = document.getElementById('other-cheap-tickets');



// Потом функции

const getData = (url, cb , reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);
    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            cb(request.response);

        } else {
            reject(request.status)
        }
    })
    request.send();
};

const showCity = (input, list) => {
    list.textContent = '';

    if (input.value === '') return

    const filterCities = city.filter((item) => {

        return item.name.toLowerCase().startsWith(input.value.toLowerCase());

    });
    filterCities.forEach((item) => {
        const li = document.createElement('li');
        li.classList.add('dropdown__city');
        li.textContent = item.name
        list.append(li)
    })
};

const selectCity = (e, input, dropdown) => {
    const target = e.target;
    if (target.tagName.toLowerCase() == 'li'){
        input.value = target.textContent
        dropdown.textContent = '';
    }
};

const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code)
  return objCity.name
};

const getDate = (date) => {
  return new Date(date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getChanges= (num) => {
  if (num) {
    return num === 1 ? 'С одной пересадкой': 'Несколько пересадок';
  } else {
    return 'Без пересадок'
  }
};

const getLinkAviaSales = (data) => {
  const api_search = 'https://www.aviasales.ru/search/';
  const date = new Date(data.depart_date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const date_for = `${day < 10 ? '0'+day: day}${month < 10 ? '0'+month: month}`

  let link = `${api_search}${data.origin}${date_for}${data.destination}1`;


  return link;
}

const createCard = (data) => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  let deep = '';

  if (data) {
    deep = `
      <h3 class="agent">${data.gate}</h3>
      <div class="ticket__wrapper">
        <div class="left-side">
          <a href="${getLinkAviaSales(data)}" target="_balnk" class="button button__buy">Купить
            за ${data.value}₽</a>
        </div>
        <div class="right-side">
          <div class="block-left">
            <div class="city__from">Вылет из города
              <span class="city__name">${getNameCity(data.origin)}</span>
            </div>
            <div class="date">${getDate(data.depart_date)}</div>
          </div>

          <div class="block-right">
            <div class="changes">${getChanges(data.number_of_changes)}</div>
            <div class="city__to">Город назначения:
              <span class="city__name">${getNameCity(data.destination)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    deep = '<h3>К сложалению на текущую дату билетов не нашлось</h3>';
  }

  ticket.insertAdjacentHTML('afterbegin', deep);
  return ticket;
};

const renderCheapYear = (cheapTickets) => {
  otherCheapTickets.style.display = 'block'
  otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

  cheapTickets.sort((a, b) => a.value - b.value);
  for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[0]);
    otherCheapTickets.append(ticket);
  };

};

const renderCheapDay = (cheapTicket) => {
  cheapestTicket.style.display = 'block'
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
};

const renderCheap = (data, date) => {
  const cheapTicketYear = JSON.parse(data).best_prices;
  const cheapTicketDay = cheapTicketYear.filter((item) => item.depart_date === date);

  renderCheapYear(cheapTicketYear);
  renderCheapDay(cheapTicketDay);
};

// Потом обработчики событий
inputCitiesFrom.addEventListener('input', () => showCity(inputCitiesFrom, dropdownCitiesFrom));
inputCitiesTo.addEventListener('input', () => showCity(inputCitiesTo, dropdownCitiesTo));

dropdownCitiesFrom.addEventListener('click', (e) => selectCity(e, inputCitiesFrom, dropdownCitiesFrom));
dropdownCitiesTo.addEventListener('click', (e) => selectCity(e, inputCitiesTo, dropdownCitiesTo));

formSearch.addEventListener('submit', (e) => {
  e.preventDefault();

  formData = {
    from: city.find((item) => inputCitiesFrom.value === item.name),
    to: city.find((item) => inputCitiesTo.value === item.name),
    when: inputDateDepart.value,
  }

  if (formData.from && formData.to) {
    const requestData  = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`

    getData(calendar + requestData, (res) => {
      renderCheap(res, formData.when);
    }, (err) => {
      alert('Туда нельзя!');
      console.log('Ошибка бля', err);

    });

  } else {
    alert('Введите норамльное название города блеать!!!')
  }

});


// Потом Вызовы функций
getData(citiesApi, (data) => {
    city = JSON.parse(data).filter(item => item.name);

    city.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name ) {
        return -1;
      }
      return 0;
    })

});

// getData( `${calendar}?dapart_date=2020-05-25&origin=SVX&destination-KGD&one_way=true&token=${API_KEY}` , data => {
//         const cheapTiket = JSON.parse(data).best_prices.filter(item => item.depart_data === '2020-05-29')
//         console.log(cheapTiket);
// });






//данная функция сразу инициализируется и ее можно использовать в любом месте кода
// function show() {

// };

// Данная реализация функции инициализируется в момент ее объявления
// и использовать можно только после объявления
// const get = function() {
//     console.log('get function');

// };

const get = (name) => {
    console.log('call get: ' + name);

}
