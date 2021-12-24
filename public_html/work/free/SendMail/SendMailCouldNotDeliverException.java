package COM.rajiv.net ;

public class SendMailCouldNotDeliverException extends Exception
{
	SendMailCouldNotDeliverException (String SMTPServer, String Reason)
	{
	super("Your message could not be delivered using the SMTP server " +
		SMTPServer + " because:\n" + Reason) ;
	}

} // end class SendMailCouldNotDeliverException

