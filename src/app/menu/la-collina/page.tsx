"use client";

import { useState } from "react";

type Item = { name: string; desc?: string; price?: string };

function Item({ name, desc, price }: Item) {
  return (
    <div className="menu-page__item">
      <span className="menu-page__item-name">
        {name}
        {desc && <span className="menu-page__item-desc">{desc}</span>}
      </span>
      {price && <span className="menu-page__item-price">{price}</span>}
    </div>
  );
}

function Fisso({ title, desc, price, note }: { title: string; desc: string; price: string; note?: string }) {
  return (
    <div className="menu-page__fisso">
      <h4>{title}{note && <span className="menu-page__item-desc"> {note}</span>}</h4>
      <p>{desc}</p>
      <div className="menu-page__fisso-price">{price}</div>
    </div>
  );
}

export default function LaCollinaMenuPage() {
  const [tab, setTab] = useState<"menu" | "aperitivo">("menu");

  return (
    <div className="menu-page">
      <header className="menu-page__header">
        <h1>LA COLLINA</h1>
        <p>Fuoco · Farina · Tradizione — since 2014</p>
      </header>

      <nav className="menu-page__tabs">
        <button type="button" className={tab === "menu" ? "is-active" : ""} onClick={() => setTab("menu")}>Menù</button>
        <button type="button" className={tab === "aperitivo" ? "is-active" : ""} onClick={() => setTab("aperitivo")}>Aperitivo</button>
      </nav>

      {tab === "menu" && (
        <section>
          <h2 className="menu-page__title">Coccetti</h2>
          <Item name="Ceci tartufati" price="5,5€" />
          <Item name="Zucca, salsiccia e amaretto" price="6€" />
          <Item name="Morbido di patate, nocciole tostate" price="6€" />
          <Item name="Vellutata di sedano rapa affumicato, balsamico, guanciale" price="6€" />
          <Item name="Fagioli con cotiche" price="6€" />
          <Item name="Trippa alla romana" price="7€" />
          <Item name="Spezzatino della tradizione" price="8€" />

          <h2 className="menu-page__title">Antipasti</h2>
          <Item name="Tagliere (misto / solo salumi / solo formaggi +2€)" price="x2 18€ · x4 32€ · x6 45€" />
          <Item name="Tris bruschette" desc="crema zucchine, stracciatella e pomodori confit, fegatini" price="4,5€" />
          <Item name="Verdure grigliate" price="8€" />

          <h2 className="menu-page__title">Fritti</h2>
          <Item name="Fritti vegetali" price="6€" />
          <Item name="Chips cacio e pepe" price="5€" />
          <Item name="Fritti artigianali" desc="suppli al telefono / al ragù, suppli zafferano e prosciutto, suppli zucca e salsiccia, crocchetta di carne e patate" price="3,5€" />

          <h2 className="menu-page__title">Specialità</h2>
          <Item name="Pizza con porri, crema di gorgonzola e guanciale" price="13€" />
          <Item name="Pizza con crema di zucca, speck e porcini" price="13€" />
          <Item name="Tar tare servita su midollo alla brace, crostoni di pane" price="20€" />
          <Item name="Pizzelle farcite (vegetariane o carnivore)" price="7€" />
          <Item name="Carpaccio di Black Angus" desc="con stracciatella e terra d'olive" price="16€" />
          <Item name="TarTare classica" price="16€" />

          <h2 className="menu-page__title">Specialità al BBQ</h2>
          <Item name="Mega Ribs (coppia)" desc="affumicate al legno di pruno e laccate con salsa artigianale" price="10€" />
          <Item name="Pancia di maiale glassata (200 gr)" price="11€" />
          <Item name="Pulled pork (200 gr)" price="11€" />
          <Item name="Brisket al piatto (150gr)" desc="punta di petto Creekstone farm affumicata all'ontano 14 ore" price="12€" />
          <Item name="Pizzelle con pulled pork affumicato al melo" price="11€" />
          <Item name="Sandwich artigianale, brisket e marmellata" price="20€" />
          <Item name="Vassoio promo BBQ M" price="24€" />
          <Item name="Vassoio promo BBQ XL" price="35€" />
          <Item name="Vassoio promo BBQ da condividere" price="60€ (30€ pax)" />

          <h2 className="menu-page__title">Carne</h2>
          <p className="menu-page__note">Aggiunta di midollo alla brace +7€</p>
          <h3 className="menu-page__group">Carne / Osso</h3>
          <Item name="Sashi Black Prussian" price="9,5€/hg" />
          <Item name="Karolina" price="8,5€/hg" />
          <Item name="Germania Strong" price="8,5€/hg" />
          <Item name="Danish Crown" price="8,5€/hg" />
          <Item name="Portogallo" price="8€/hg" />
          <Item name="T-bone galiziana" price="7,5€/hg" />
          <Item name="Irlandese" price="7,5€/hg" />
          <Item name="Frisona nazionale" price="7€/hg" />
          <h3 className="menu-page__group">Carne S/Osso</h3>
          <Item name="Tagliata" desc="con lardo +2€, con porcini +4€" price="21€" />
          <Item name="Straccetti" price="18€" />
          <Item name="Filetto" price="25€" />
          <Item name="Trittico" desc="tagliata classica, con lardo, con funghi porcini" price="35€" />
          <Item name="Galletto" price="16€" />
          <Item name="Abbacchio" price="18€" />
          <Item name="Arrosticini (10 pezzi)" price="20€" />
          <h3 className="menu-page__group">Contorni</h3>
          <Item name="Insalata verde" price="4€" />
          <Item name="Focaccia al rosmarino" price="5€" />
          <Item name="Patate al forno" price="4€" />
          <Item name="Patate fritte" price="5€" />
          <Item name="Cicoria ripassata" price="4€" />

          <h2 className="menu-page__title">Primi</h2>
          <p className="menu-page__note">Carbonara, Amatriciana, Gricia, Cacio e Pepe sempre disponibili — 13€</p>
          <Item name="Fettuccine ai funghi porcini" price="16€" />
          <Item name="Ravioli alla crema di noci" price="14€" />
          <Item name="Tonnarelli asparagi e guanciale" price="15€" />
          <Item name="Pappardelle al cinghiale" price="16€" />
          <Item name="Primo della settimana" price="15€" />

          <h2 className="menu-page__title">Pizza</h2>
          <h3 className="menu-page__group">Classiche</h3>
          <Item name="Margherita" price="8€" />
          <Item name="Funghi" price="8,5€" />
          <Item name="Marinara" price="6,5€" />
          <Item name="Diavola" price="7,5€" />
          <Item name="Capricciosa" price="9,5€" />
          <Item name="'Nduja" desc="'nduja, pomodoro bruciato, provola affumicata" price="12€" />
          <h3 className="menu-page__group">Bianche</h3>
          <Item name="Crostino" price="8,5€" />
          <Item name="Quattro formaggi" price="10€" />
          <Item name="Broccoli e salsiccia" price="10,5€" />
          <Item name="Patate e mozzarella" price="9,5€" />
          <Item name="Fiori di zucca e alici" price="10€" />
          <Item name="Golosa" desc="porcini, maiale, crema di peperoni" price="12€" />
          <h3 className="menu-page__group">Speciali</h3>
          <Item name="Margherita 2.0" desc="mousse di parmigiano, mozz., pomodori confit e olio basilico" price="10€" />
          <Item name="Bomba" desc="maiale sfilacciato, stracchino, friggitelli" price="12€" />
          <Item name="Calzone calabrese" desc="pomodoro, provola, melanzane, 'nduja" price="11€" />
          <Item name="La Collina" desc="mozzarella, porcini, salsiccia, crema tartufata" price="11€" />
          <Item name="Amatriciana" price="10€" />
          <Item name="Formaggio in 4" desc="ricotta, summa Parmigiano, Gorgonzola, pecorino" price="11€" />

          <h2 className="menu-page__title">Dolci</h2>
          <Item name="Sorbetto" price="3,5€" />
          <Item name="Tortino con cuore fondente" desc="cioccolato o pistacchio" price="7,5€" />
          <Item name="Tiramisù" price="6€" />
          <Item name="Semifreddo allo zabaione artigianale" price="7€" />
          <Item name="Blondie" desc="brownie bianco con zucchero moscovado e arachidi" price="6,5€" />
          <Item name="Panna cotta e vaniglia Bourbon" price="6€" />
          <Item name="Sbriciolata, crema diplomatica" price="6,5€" />
          <Item name="Babà artigianale con crema" desc="farcito di crema fatta in casa e accompagnato da panna — grande 10€" price="7€" />
          <p className="menu-page__note">Coperto 1€ — per ingredienti ed allergeni chiedere al personale di sala</p>

          <h2 className="menu-page__title">Menù a prezzo fisso</h2>
          <Fisso title="Menù degustazione domenicale" desc="Tagliere misto accompagnato da un concetto dello chef · Primo dello chef (a scelta) · Tagliata · Contorno" price="38€" />
          <Fisso title="Menù braciere" desc="Fritto della casa · Coccetto · Tagliata (filetto +3€, costata 400gr +5€) · Contorno" price="30€" />
          <Fisso title="Menù pasta" desc="Tagliere misto · Coccetto stagionale · Primo dello chef" price="25€" />
          <Fisso title="Menù carnivoro — medio" note="(consigliato per 4 persone)" desc="Fritto artigianale della casa · Coccetti stagionali a cantrotavola · Fiorentina 1kg · Costata 1kg · Contorno" price="130€" />
          <Fisso title="Menù carnivoro — grande" note="(consigliato per 6 persone)" desc="Tagliere misto XL · Coccetti stagionali a cantrotavola · Fiorentina 1.5kg · Costata 1.5kg · Contorno" price="180€" />
          <Fisso title="Menù BBQ" note="(per 2 persone)" desc="2 side dishes americani (coleslaw, chilli con carne) · Patate fritte · Vassoio misto BBQ XXL · Blondie" price="30€ a persona" />

          <h2 className="menu-page__title">Vini — Territorio</h2>
          <h3 className="menu-page__group">Rossi</h3>
          <Item name='Merlot "La Collina"' price="15€" />
          <Item name='Merlot "Sodale"' price="25€" />
          <Item name='Syrah "Castello Torre in Pietra"' price="22€" />
          <Item name="Parentes" price="21€" />
          <Item name="Silicea" price="21€" />
          <Item name='Cesanese DOP "Olevano Romano"' price="22€" />
          <Item name="Iuno" price="26€" />
          <Item name='Syrah "13"' price="18€" />
          <h3 className="menu-page__group">Bianchi</h3>
          <Item name='Frascati "Della Casa"' price="15€" />
          <Item name="Anthium Bellone" price="27€" />
          <Item name="Cacchione" price="18€" />
          <Item name="Satrico" price="18€" />
          <Item name="Vigneto Filonardi" price="40€" />
          <Item name="Elephas Bianco" price="16€" />
          <Item name='Malvasia Puntinata "Roma"' price="18€" />
          <Item name="Tophos" price="18€" />
          <Item name='Villa dei Preti "Villa Simone"' price="30€" />

          <h2 className="menu-page__title">Vini — Italia</h2>
          <h3 className="menu-page__group">Rossi</h3>
          <Item name='Montepulciano d&apos;Abruzzo "Vallevo"' price="20€" />
          <Item name="Morellino di Scansano" price="23€" />
          <Item name="Vitiano" price="23€" />
          <Item name="Shiraz Casale del Giglio" price="25€" />
          <Item name='Il Bruno dei Vespa "Salento Primitivo"' price="26€" />
          <Item name="Nobile di Montepulciano" price="45€" />
          <Item name="Valpolicella Ripasso" price="45€" />
          <h3 className="menu-page__group">Bianchi</h3>
          <Item name="Imago" price="21€" />
          <Item name="Bianca Terra Fiano" price="21€" />
          <Item name="Chardonnay" price="21€" />
          <Item name='Pecorino "Vallevò"' price="21€" />
          <Item name="Pinot Grigio" price="25€" />
          <Item name="Sauvignon" price="25€" />
          <h3 className="menu-page__group">Rosè</h3>
          <Item name="Chiaretto di Bardolino" price="20€" />
          <Item name="Mezzaluna Frizzante" price="25€" />
          <h3 className="menu-page__group">Bollicine</h3>
          <Item name="Lenynae Mill." price="25€" />
          <Item name="Spumante Brut" price="27€" />
          <Item name='Brut Rosé "Noi Tre"' price="28€" />
          <Item name="Valdobbiadine DOCG" price="29€" />

          <h2 className="menu-page__title">Birre</h2>
          <Item name="Birrificio Alvarese — Rossa" price="6€" />
          <Item name="Spina 0.4/0.2 cl — Ichnusa, Moretti, Moretti Rossa" price="4,5/6,5€" />
          <h3 className="menu-page__group">Birrificio RadioCraft Beer</h3>
          <Item name='Pils "Claire" 5%' price="6€" />
          <Item name='Belgian Strong Ale "Dona Summer" 8.9%' price="6€" />
          <Item name='New Zealand IPA "Pinball Wizard" 6%' price="6€" />
          <Item name='Black IPA "Get Out" 6.5%' price="6€" />
          <Item name='IPA "Teardrop" 4.6%' price="6€" />
          <Item name='DIPA "Chop Suey" 7.5%' price="6€" />
          <h3 className="menu-page__group">Birrificio Castelli</h3>
          <Item name='DDH Session IPA "Sosia" 4.5%' price="7€" />
          <Item name='Tripel "Ultimatum" 8%' price="7€" />
          <Item name='Gluten Free IPA "Carpe Diem" 5.7%' price="7€" />
          <Item name='Gose "Mare Nostrum" 4.5%' price="7€" />
          <h3 className="menu-page__group">Birrificio Ritual Labs</h3>
          <Item name="Ritual Pills" price="6,5€" />
          <Item name="Super Lemon Ale" price="6,5€" />
          <Item name='"Oxbow x Ritual" Tangie' price="8€" />

          <h2 className="menu-page__title">Bevande & Distillati</h2>
          <Item name="Acqua (naturale, leggermente frizzante)" price="2,5€" />
          <Item name="Soft drink (Pepsi, Pepsi Zero, Miranda, 7UP)" price="3,5€" />
          <Item name="Soft drink 1lt" price="5,5€" />
          <Item name="Caffè (normale, decaffeinato)" price="1,5€" />
          <Item name="Amaro alle erbe" price="4,5€" />
          <Item name="Limoncello" price="4,5€" />
          <Item name="Grappa della casa" price="4,5€" />
          <Item name="Liquore crema alpina (nocciola, fragola, melone)" price="5€" />
          <Item name="Amari nazionali" price="5€" />
          <Item name="Jefferson" price="7€" />
          <Item name="Rum" price="8€" />
          <Item name="Whiskey Laphroaig 10 anni" price="7€" />
          <Item name="Grappa artigianale" price="6€" />
          <Item name='"Le erbe" (Ortica, Ginepro)' price="6€" />

          <h2 className="menu-page__title">Allergeni</h2>
          <ol className="menu-page__allergens">
            <li>Glutine</li><li>Crostacei</li><li>Uova</li><li>Pesce</li><li>Arachidi</li><li>Soia</li><li>Latte</li>
            <li>Frutta a guscio</li><li>Sedano</li><li>Senape</li><li>Semi di senape</li><li>Anidride solforosa e solfiti</li><li>Lupini</li><li>Molluschi</li>
          </ol>
        </section>
      )}

      {tab === "aperitivo" && (
        <section>
          <h2 className="menu-page__title">Cocktails & Drinks</h2>
          <h3 className="menu-page__group">Birra alla spina</h3>
          <Item name="Moretti, Ichnusa, Rossa 0.4 cl" price="5,5€" />
          <Item name="Birra alla spina 0.2 cl" price="4,5€" />
          <h3 className="menu-page__group">Birrificio &quot;Alvarese&quot; (Monte Compatri)</h3>
          <Item name="Weiss 33cl" price="5,5€" />
          <Item name="Rossa 33cl" price="5,5€" />
          <Item name="Tripel 33cl" price="5,5€" />
          <Item name="Scottish Export 33cl" price="5,5€" />
          <Item name="Pils 33cl" price="5,5€" />
          <Item name="Gluten free 33cl" price="5,5€" />
          <h3 className="menu-page__group">Birrificio Ritual Pils</h3>
          <Item name="Ritual Pils" price="6,5€" />
          <Item name="Super Lemon Ale" price="6,5€" />
          <Item name="Oxbow x Ritual - Tangie" price="8€" />
          <h3 className="menu-page__group">Birrificio &quot;Castelli&quot;</h3>
          <Item name="Gose 5%" price="7€" />
          <Item name="Tripel 8%" price="7€" />
          <Item name="DDH Session IPA 4.5%" price="7€" />
          <Item name="Gluten Free IPA 4.5%" price="7€" />
          <h3 className="menu-page__group">Birrificio &quot;RadioCraft Beer&quot; (Albano Laziale)</h3>
          <Item name='Blanche "Amelie" 5%' price="6€" />
          <Item name='Pils "Claire" 5%' price="6€" />
          <Item name='Belgian Strong Ale "Dona Summer" 8%' price="6€" />
          <Item name='IPA "LSD" 3.9%' price="6€" />
          <Item name='Black IPA "Get Out" 6.5%' price="6€" />
          <Item name='New Zealand IPA "Pinball Wizard"' price="6€" />

          <h3 className="menu-page__group">Vino & Bollicine</h3>
          <Item name="Calice Prosecco" price="5€" />
          <Item name="Vino bianco/rosso (calice)" price="5€" />

          <h3 className="menu-page__group">Spritz</h3>
          <Item name="Campari" price="6,5€" />
          <Item name="Aperol" price="6,5€" />
          <Item name="Hugo" price="6,5€" />

          <h3 className="menu-page__group">Cocktail</h3>
          <Item name="Vodka Tonic" desc="vodka, acqua tonica" price="6,5€" />
          <Item name="Gin Tonic" desc="gin, tonica" price="6,5€" />
          <Item name="Gin Lemon" price="6,5€" />
          <Item name="Negroni" desc="vermouth rosso, Campari, gin" price="7€" />
          <Item name="Americano" desc="vermouth rosso, Campari" price="7€" />
          <Item name="Margarita" desc="tequila, triple sec, lime" price="7€" />
          <Item name="Paloma" desc="tequila, pompelmo rosa, lime" price="7€" />

          <h2 className="menu-page__title">BBQ e stuzzichini</h2>
          <Item name="Panino alle ciliegie con pastrami" desc="pane alle ciliegie artigianale, marmellata di ciliegie nostra produzione, senape, New York pastrami affumicato al balsamico 12 ore" price="14€" />
          <Item name="Panino con burnt ends glassate, brie e coleslaw" desc="panino con spuntature affumicate, brie e coleslaw" price="12€" />
          <Item name="Piatto di assaggi BBQ" desc="misto di assaggi bbq serviti con salse artigianali" price="10€" />
          <Item name="Pizzelle con pulled pork affumicato" desc="coppia di pizzelle farcite con pulled pork affumicato 10 ore al ciliegio, cipolla caramellata" price="11€" />
          <Item name="Pancia di maiale glassata" desc="affumicata e glassata al forno" price="9€" />
          <Item name="Brisket al piatto" desc="servito con pickles artigianali e pane alle ciliegie" price="11€" />
          <Item name="Vassoio BBQ — Medio" price="24€" />
          <Item name="Vassoio BBQ — Grande" price="35€" />
          <p className="menu-page__note">Allergeni: vedi menù principale.</p>
        </section>
      )}

      <footer className="menu-page__footer">La Collina — Via Frascati Colonna 74, Monte Compatri (RM)</footer>
    </div>
  );
}
