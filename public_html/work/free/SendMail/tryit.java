
import java.io.* ;

import COM.rajiv.net.SendMail ;


/**

tryit - A java program to test Betul's SendMail class.

usage:

java tryit

*/


class tryit
{

static String mail_server = "mail.domain.com" ;

static String from = "user@domain.com" ;
static String to = "test@domain.com" ;

static String headers = "From: User Testing <user@domain.com>\n" +
	"To: Test Address <test@domain.com>\n" +
	"Subject: This is a test message to test the SendMail class.\n" ;


static String body = "This is line 1.\n" +
	"This is the 2nd line.\n" +
	"The third line.\n" +
	"Line number four.\n\n" +
	" -- Signature line.\n" ;

public static void main (String[] args)
{

	SendMail mailer = new SendMail() ;

	mailer.setSMTPServer (mail_server) ;

	mailer.setFrom (from) ;
	mailer.setTo (to) ;
	mailer.setHeaders (headers) ;
	mailer.setBody (body) ;

	try {
		mailer.deliver() ;
	} catch (Exception e) {
	System.out.println (e) ;
	}

	System.out.println ("The SMTP server is set to " +
		mailer.getSMTPServer() + "\n" +
		"Message sent.") ;

} // end main(String[]) ;


} // end class tryit

