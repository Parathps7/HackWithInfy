const OpenAI = require('openai');
const readline = require('readline');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize conversation history
let conversationHistory = [];

const chat = asyncHandler(async (req, res) => {
  const content = req.body.message;
  conversationHistory.push({ role: 'user', content });

  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: conversationHistory,
    });

    const assistantResponse = completion.choices[0].message.content;

    // Add assistant response to conversation history
    conversationHistory.push({ role: 'assistant', content: assistantResponse });

    // Send assistant response
    res.status(200).send({ 'Assistant': assistantResponse });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    res.status(400).send({ 'Error': error.message });
  }
});

const transcript = ` 00:00:00.399 right from the start software
00:00:02.000 development comprise two different
00:00:03.760 departments the development team that
00:00:05.920 develops the plan designs and builds the
00:00:08.559 system from scratch and the operation
00:00:11.040 team for testing and implementation of
00:00:12.960 whatever is developed the operations
00:00:15.200 team gave the development team feedback
00:00:16.960 on any bugs that needed fixing and any
00:00:19.439 rework required invariably the
00:00:21.760 development team would be idle awaiting
00:00:23.840 feedback from the operations team
00:00:26.080 this undoubtedly extended timelines and
00:00:28.320 delayed the entire software development
00:00:30.320 cycle there would be instances where the
00:00:32.558 development team moves on to the next
00:00:34.399 project while the operations team
00:00:36.399 continues to provide feedback for the
00:00:38.160 previous code
00:00:39.600 this meant weeks or even months for the
00:00:41.760 project to be closed and final code to
00:00:44.079 be developed now what if the two
00:00:46.480 departments came together and worked in
00:00:48.960 collaboration with each other what if
00:00:51.120 the wall of confusion was broken
00:00:54.079 and this is called the devops approach
00:00:56.800 the devops symbol resembles an infinity
00:00:59.039 sign suggesting that it is a continuous
00:01:01.199 process of improving efficiency and
00:01:03.359 constant activity the devops approach
00:01:06.000 makes companies adapt faster to updates
00:01:08.000 and development changes the teams can
00:01:10.320 now deliver quickly and the deployments
00:01:12.880 are more consistent and smooth though
00:01:14.960 there may be communication challenges
00:01:17.119 devops manages a streamlined flow
00:01:19.040 between the teams and makes the software
00:01:21.119 development process successful the
00:01:23.680 devops culture is implemented in several
00:01:25.680 phases with the help of several tools
00:01:28.080 let's have a look at these phases
00:01:30.400 the first phase is the planning phase
00:01:32.799 where the development team puts down a
00:01:34.560 plan keeping in mind the application
00:01:36.479 objectives that are to be delivered to
00:01:38.240 the customer
00:01:39.439 once the plan is made the coding begins
00:01:42.240 the development team works on the same
00:01:44.240 code and different versions of the code
00:01:46.159 are stored into a repository with the
00:01:48.240 help of tools like get and merged when
00:01:50.399 required this process is called version
00:01:52.799 control the code is then made executable
00:01:55.119 with tools like maven and gradle in the
00:01:57.040 build stage
00:01:58.640 after the code is successfully built it
00:02:00.719 is then tested for any bugs or errors
00:02:03.360 the most popular tool for automation
00:02:05.280 testing is selenium
00:02:07.200 once the code has passed several manual
00:02:09.199 and automated tests we can say that it
00:02:11.520 is ready for deployment and is sent to
00:02:13.680 the operations team
00:02:15.599 the operations team now deploys the code
00:02:17.920 to the working environment the most
00:02:20.000 prominent tools used to automate these
00:02:21.840 phases are ansible docker and kubernetes
00:02:25.360 after the deployment the product is
00:02:27.120 continuously monitored and nagios is one
00:02:29.920 of the top tools used to automate this
00:02:32.000 phase
00:02:32.879 the feedback received after this phase
00:02:34.959 is sent back to the planning phase and
00:02:37.200 this is what forms the core of the
00:02:38.879 devops life cycle that is the
00:02:41.040 integration phase
00:02:42.640 jenkins is the tool that sends the code
00:02:44.560 for building and testing if the code
00:02:46.720 passes the test it is sent for
00:02:48.480 deployment and this is referred to as
00:02:50.640 continuous integration
00:02:52.640 there are many tech giants and
00:02:54.000 organizations that have opted for the
00:02:55.599 devops approach for example amazon
00:02:58.720 netflix walmart facebook and adobe
00:03:02.080 netflix introduced its online streaming
00:03:03.920 service in 2007.
00:03:06.000 in 2014 it was estimated that a downtime
00:03:08.959 for about an hour would cost netflix 200
00:03:11.599 000
00:03:12.879 however now netflix can cope with such
00:03:15.280 issues they opted for devops in the most
00:03:18.239 fantastic way
00:03:19.840 netflix developed a tool called the
00:03:21.680 simeon army that continuously created
00:03:23.840 bugs in the environment without
00:03:25.519 affecting the users
00:03:27.040 this chaos motivated the developers to
00:03:29.440 build a system that does not fall apart
00:03:31.680 when any such thing happens
00:03:33.920 so on this note here is a quiz for you
00:03:36.959 match the devops tool with the phase it
00:03:39.360 is used in
00:03:40.560 a
00:03:44.720 b
00:03:48.959 c
00:03:49.410 [Music]
00:03:53.280 d
00:03:54.080 none of the above
00:03:55.840 today more and more companies lean
00:03:57.840 towards automation with the aim of
00:03:59.840 reducing its delivery time and the gap
00:04:02.000 between its development and operations
00:04:04.000 teams to attain all of these there's
00:04:07.040 just one gateway
00:04:08.959 devops
00:04:10.159 and if you're also looking forward to
00:04:11.840 doing the same and excel in devops check
00:04:14.400 out simply learn's post-graduate program
00:04:16.160 in devops design and collaboration with
00:04:18.160 caltech ctme
00:04:19.839 the program can help you master several
00:04:21.839 in-demand devops skills and tools like
00:04:24.639 continuous integration and delivery
00:04:26.800 devops on cloud kubernetes docker and
00:04:29.840 much more we hope you enjoyed this video
00:04:32.560 if you did a thumbs up would be really
00:04:34.639 appreciated here's your reminder to
00:04:36.639 subscribe to our channel and to click on
00:04:38.560 the bell icon for more on the latest
00:04:40.560 technologies and trends thank you for
00:04:42.720 watching and stay tuned for more from
00:04:45.199 simplylearn
00:05:00.960 you
`

const segmentTranscript = async (transcript, openai) => {
  const messages = [
    {
      role: "system",
      content: "You are an assistant that helps with segmenting transcripts.",
    },
    {
      role: "user",
      content: `Divide the following transcript into logical segments that cover a topic completely with timestamps and time duration of each segment should atleast 3 minutes long:\n\n${transcript}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 500,
  });

  return response.choices[0].message.content.trim().split('\n\n');
};

const main = async () => {
  try {
    const segments = await segmentTranscript(transcript, openai);
    console.log(segments);
  } catch (error) {
    console.error("Error segmenting transcript:", error.message);
  }
};

main();


// module.exports = { chat };
