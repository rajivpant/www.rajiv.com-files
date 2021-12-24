package COM.rajiv.net ;

public class SendMailResponseException extends Exception
{
	SendMailResponseException (String SMTPServer,
		String ServerResponseLine,
		String ExpectedResponseCode)
	{
	super("The SMTP server " + SMTPServer +
		" returned the following response:\n" + ServerResponseLine +
		"\n" +
		" It did not start with the expected response code of " +
		ExpectedResponseCode) ;
	}

} // end class SendMailResponseException
