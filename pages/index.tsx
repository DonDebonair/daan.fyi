import { Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import CustomLink from '@/components/CustomLink';

const IndexPage = (): ReactNode => (
    <DefaultLayout title="Home | Daan Debie">
        <Heading as="h1" size="2xl">
            Huius, Lyco, oratione locuples, rebus ipsis ielunior.
        </Heading>

        <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. An vero displicuit ea, quae
            tributa est animi virtutibus tanta praestantia? Ergo in bestiis erunt secreta e
            voluptate humanarum quaedam simulacra virtutum, in ipsis hominibus virtus nisi
            voluptatis causa nulla erit? <b>Iam in altera philosophiae parte.</b> Quae animi
            affectio suum cuique tribuens atque hanc, quam dico. Summus dolor plures dies manere non
            potest? <i>Duo Reges: constructio interrete.</i>
        </Text>

        <blockquote cite="http://loripsum.net">
            Ita fiet, ut animi virtus corporis virtuti anteponatur animique virtutes non voluntarias
            vincant virtutes voluntariae, quae quidem proprie virtutes appellantur multumque
            excellunt, propterea quod ex ratione gignuntur, qua nihil est, in homine divinius.
        </blockquote>

        <Text>
            <b>Tollitur beneficium, tollitur gratia, quae sunt vincla concordiae.</b> Dici enim
            nihil potest verius. Igitur ne dolorem quidem. Fortitudinis quaedam praecepta sunt ac
            paene leges, quae effeminari virum vetant in dolore. Ne tum quidem te respicies et
            cogitabis sibi quemque natum esse et suis voluptatibus? Nihilne te delectat umquam
            -video, quicum loquar-, te igitur, Torquate, ipsum per se nihil delectat? Illud mihi a
            te nimium festinanter dictum videtur, sapientis omnis esse semper beatos;{' '}
            <b>Age, inquies, ista parva sunt.</b>
        </Text>

        <Heading as="h2" size="xl">
            Quid ait Aristoteles reliquique Platonis alumni?
        </Heading>

        <Text>
            <CustomLink href="http://loripsum.net/">
                An hoc usque quaque, aliter in vita?
            </CustomLink>{' '}
            Non quaero, quid dicat, sed quid convenienter possit rationi et sententiae suae dicere.{' '}
            <CustomLink href="http://loripsum.net/">Conferam avum tuum Drusum cum C.</CustomLink>{' '}
            <CustomLink href="http://loripsum.net/">Si longus, levis dictata sunt.</CustomLink>{' '}
            Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione
            consequi. Est autem a te semper dictum nec gaudere quemquam nisi propter corpus nec
            dolere. Qui autem esse poteris, nisi te amor ipse ceperit?{' '}
            <b>Honesta oratio, Socratica, Platonis etiam.</b> Iam argumenti ratione conclusi caput
            esse faciunt ea, quae perspicua dicunt, deinde ordinem sequuntur, tum, quid verum sit in
            singulis, extrema conclusio est. Quippe: habes enim a rhetoribus; Quasi vero aut
            concedatur in omnibus stultis aeque magna esse vitia, et eadem inbecillitate et
            inconstantia L.{' '}
        </Text>

        <Text>
            Tum ille: Finem, inquit, interrogandi, si videtur, quod quidem ego a principio ita me
            malle dixeram hoc ipsum providens, dialecticas captiones.{' '}
            <CustomLink href="http://loripsum.net/">
                Certe, nisi voluptatem tanti aestimaretis.
            </CustomLink>{' '}
            Quae rursus dum sibi evelli ex ordine nolunt, horridiores evadunt, asperiores, duriores
            et oratione et moribus. Iam id ipsum absurdum, maximum malum neglegi. Quod non faceret,
            si in voluptate summum bonum poneret.{' '}
        </Text>

        <ul>
            <li>Quamquam in hac divisione rem ipsam prorsus probo, elegantiam desidero.</li>
            <li>Quamquam haec quidem praeposita recte et reiecta dicere licebit.</li>
            <li>Cum id fugiunt, re eadem defendunt, quae Peripatetici, verba.</li>
            <li>
                Quibus natura iure responderit non esse verum aliunde finem beate vivendi, a se
                principia rei gerendae peti;
            </li>
        </ul>

        <Text>
            <CustomLink href="http://loripsum.net/">Certe non potest.</CustomLink>{' '}
            <b>Magna laus.</b> Est enim effectrix multarum et magnarum voluptatum. Sin te auctoritas
            commovebat, nobisne omnibus et Platoni ipsi nescio quem illum anteponebas? Non quaero,
            quid dicat, sed quid convenienter possit rationi et sententiae suae dicere. Non prorsus,
            inquit, omnisque, qui sine dolore sint, in voluptate, et ea quidem summa, esse dico. Hoc
            foedus facere si potuerunt, faciant etiam illud, ut aequitatem, modestiam, virtutes
            omnes per se ipsas gratis diligant. Etsi ea quidem, quae adhuc dixisti, quamvis ad
            aetatem recte isto modo dicerentur. Scaevola tribunus plebis ferret ad plebem vellentne
            de ea re quaeri.{' '}
        </Text>

        <Heading as="h3" size="lg">
            Proclivi currit oratio.
        </Heading>

        <Text>
            <CustomLink href="http://loripsum.net/">
                Beatus autem esse in maximarum rerum timore nemo potest.
            </CustomLink>{' '}
            Minime vero probatur huic disciplinae, de qua loquor, aut iustitiam aut amicitiam
            propter utilitates adscisci aut probari. Cupit enim dícere nihil posse ad beatam vitam
            deesse sapienti. Qui igitur convenit ab alia voluptate dicere naturam proficisci, in
            alia summum bonum ponere? Quid ei reliquisti, nisi te, quoquo modo loqueretur,
            intellegere, quid diceret? Teneo, inquit, finem illi videri nihil dolere. Nec vero alia
            sunt quaerenda contra Carneadeam illam sententiam. Roges enim Aristonem, bonane ei
            videantur haec: vacuitas doloris, divitiae, valitudo;{' '}
        </Text>

        <dl>
            <dt>
                <dfn>Nulla erit controversia.</dfn>
            </dt>
            <dd>
                Et tamen ego a philosopho, si afferat eloquentiam, non asperner, si non habeat, non
                admodum flagitem.
            </dd>
            <dt>
                <dfn>Pollicetur certe.</dfn>
            </dt>
            <dd>
                Theophrastus mediocriterne delectat, cum tractat locos ab Aristotele ante tractatos?
            </dd>
        </dl>
    </DefaultLayout>
);
export default IndexPage;
